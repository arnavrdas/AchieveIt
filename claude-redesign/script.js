/* ═══════════════════════════════════════════════════
   AchvIt — script.js
   ═══════════════════════════════════════════════════ */

/* ─── DOM refs ─── */
const quadrant1  = document.getElementById('quadrant1');
const quadrant2  = document.getElementById('quadrant2');
const quadrant3  = document.getElementById('quadrant3');
const quadrant4  = document.getElementById('quadrant4');
const singlelist = document.getElementById('singlelist');

/* ─── Persistent state ─── */
const todaysTasks            = JSON.parse(localStorage.getItem('todaysTasks'))            || [];
const allTasksQuadrant1      = JSON.parse(localStorage.getItem('allTasksQuadrant1'))      || [];
const allTasksQuadrant2      = JSON.parse(localStorage.getItem('allTasksQuadrant2'))      || [];
const allTasksQuadrant3      = JSON.parse(localStorage.getItem('allTasksQuadrant3'))      || [];
const allTasksQuadrant4      = JSON.parse(localStorage.getItem('allTasksQuadrant4'))      || [];
const archivedTasksQuadrant1 = JSON.parse(localStorage.getItem('archivedTasksQuadrant1')) || [];
const archivedTasksQuadrant2 = JSON.parse(localStorage.getItem('archivedTasksQuadrant2')) || [];
const archivedTasksQuadrant3 = JSON.parse(localStorage.getItem('archivedTasksQuadrant3')) || [];
const archivedTasksQuadrant4 = JSON.parse(localStorage.getItem('archivedTasksQuadrant4')) || [];
const routineTasks           = JSON.parse(localStorage.getItem('routineTasks'))           || [];

const views = [
    [allTasksQuadrant1, allTasksQuadrant2, allTasksQuadrant3, allTasksQuadrant4],
    [todaysTasks],
    [archivedTasksQuadrant1, archivedTasksQuadrant2, archivedTasksQuadrant3, archivedTasksQuadrant4],
    [routineTasks],
];

// settings[0] = view index (0-3), settings[1] = isDark (bool)
const settings = JSON.parse(localStorage.getItem('settings')) || [0, true];

/* ─── Desktop form state ─── */
let desktopImpact = false;

/* ─── Keyboard navigation: focused task ─── */
let focusedTaskIndex = -1;
let focusedTaskList  = null;

/* ─── View metadata ─── */
const viewMeta = [
    { name: 'Matrix',  subtitle: 'Eisenhower' },
    { name: 'Today',   subtitle: 'Focus' },
    { name: 'Archive', subtitle: 'Completed' },
    { name: 'Routine', subtitle: 'Recurring' },
];

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
switchView(settings[0]);
displayTasks();
settings[1] ? setDarkMode() : setLightMode();

/* ══════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════ */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 2200);
}

function haptic(style) {
    // 'light' | 'medium' | 'heavy'
    if (!navigator.vibrate) return;
    const patterns = { light: 8, medium: 18, heavy: [30, 10, 30] };
    navigator.vibrate(patterns[style] || 10);
}

function isMobile() { return window.innerWidth <= 1024; }

/* ══════════════════════════════════════════════════
   TASK STORAGE  ("task|deadline|schedule|impact")
══════════════════════════════════════════════════ */
function buildTaskString(task, deadline, schedule, impact) {
    return `${task.trim()}|${deadline.trim()}|${schedule.trim()}|${impact ? '/' : ''}`;
}

function pushTask(taskStr, deadline, impact) {
    const v = settings[0];
    if (v === 0 || v === 2) {
        if (deadline !== '') {
            impact ? views[v][0].push(taskStr) : views[v][2].push(taskStr);
        } else {
            impact ? views[v][1].push(taskStr) : views[v][3].push(taskStr);
        }
    } else if (v === 1) {
        todaysTasks.push(taskStr);
    } else if (v === 3) {
        routineTasks.push(taskStr);
    }
}

/* ══════════════════════════════════════════════════
   DESKTOP INPUT
══════════════════════════════════════════════════ */
function toggleImpact() {
    desktopImpact = !desktopImpact;
    const btn   = document.getElementById('f-impact');
    const icon  = document.getElementById('impact-icon');
    const label = document.getElementById('impact-label');
    if (desktopImpact) {
        btn.classList.add('is-active');
        icon.textContent  = '◉';
        label.textContent = 'Long-term';
    } else {
        btn.classList.remove('is-active');
        icon.textContent  = '○';
        label.textContent = 'None';
    }
}

function submitDesktopForm() {
    const task     = document.getElementById('f-task').value.trim();
    const deadline = document.getElementById('f-deadline').value.trim();
    const schedule = document.getElementById('f-schedule').value.trim();
    if (!task) {
        document.getElementById('f-task').focus();
        shakeField('fg-task');
        return;
    }
    const str = buildTaskString(task, deadline, schedule, desktopImpact);
    pushTask(str, deadline, desktopImpact);
    saveTasks();
    displayTasks();
    clearDesktopForm();
    document.getElementById('f-task').focus();
}

function clearDesktopForm() {
    document.getElementById('f-task').value     = '';
    document.getElementById('f-deadline').value = '';
    document.getElementById('f-schedule').value = '';
    if (desktopImpact) toggleImpact();
}

function shakeField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = 'var(--danger)';
    el.style.outline = '2px solid var(--danger)';
    setTimeout(() => { el.style.borderColor = ''; el.style.outline = ''; }, 800);
}

/* ══════════════════════════════════════════════════
   MOBILE MODAL  (add / edit)
══════════════════════════════════════════════════ */
let mobileImpact   = false;
let modalEditIndex = null;
let modalEditList  = null;

function openModal(editData) {
    modalEditIndex = null;
    modalEditList  = null;

    const sheet  = document.getElementById('modal-sheet');
    const overlay = document.getElementById('modal-overlay');
    const title  = document.getElementById('modal-title');
    const submit = document.getElementById('modal-submit');

    if (editData) {
        modalEditIndex = editData.index;
        modalEditList  = editData.list;
        const parts    = editData.taskStr.split('|');
        sheet.classList.add('edit-mode');
        title.textContent  = 'Edit Task';
        submit.textContent = 'Save Changes';
        document.getElementById('m-task').value     = parts[0] || '';
        document.getElementById('m-deadline').value = parts[1] || '';
        document.getElementById('m-schedule').value = parts[2] || '';
        selectImpact(parts[3] === '/');
    } else {
        sheet.classList.remove('edit-mode');
        title.textContent  = 'Add Task';
        submit.textContent = 'Add Task';
        document.getElementById('m-task').value     = '';
        document.getElementById('m-deadline').value = '';
        document.getElementById('m-schedule').value = '';
        selectImpact(false);
    }

    overlay.style.display = 'block';
    sheet.style.display   = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.add('open');
        sheet.classList.add('open');
    }));
    setTimeout(() => document.getElementById('m-task').focus(), 50);
}

function closeModal() {
    const sheet   = document.getElementById('modal-sheet');
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
    sheet.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
        sheet.style.display   = 'none';
    }, 10);
}

function selectImpact(val) {
    mobileImpact = val;
    document.getElementById('impact-none').classList.toggle('active', !val);
    document.getElementById('impact-yes').classList.toggle('active',  val);
}

function submitMobileForm() {
    const task     = document.getElementById('m-task').value.trim();
    const deadline = document.getElementById('m-deadline').value.trim();
    const schedule = document.getElementById('m-schedule').value.trim();

    if (!task) {
        document.getElementById('m-task').focus();
        document.getElementById('m-task').style.borderColor = 'var(--danger)';
        setTimeout(() => document.getElementById('m-task').style.borderColor = '', 1200);
        return;
    }

    const str = buildTaskString(task, deadline, schedule, mobileImpact);
    if (modalEditIndex !== null && modalEditList !== null) {
        modalEditList[modalEditIndex] = str;
    } else {
        pushTask(str, deadline, mobileImpact);
    }
    saveTasks();
    displayTasks();
    closeModal();
    haptic('light');
    showToast(modalEditIndex !== null ? 'Task updated' : 'Task added');
}

/* ══════════════════════════════════════════════════
   MOBILE ACTION SHEET
══════════════════════════════════════════════════ */
let actionContext = null;

function openActionSheet(ctx) {
    actionContext = ctx;
    const sheet   = document.getElementById('action-sheet');
    const overlay = document.getElementById('action-overlay');

    document.getElementById('action-task-label').textContent = ctx.splitTask[0];

    document.getElementById('act-today').querySelector('.act-icon').nextSibling.textContent =
        settings[0] === 1 ? ' Move to All Tasks' : ' Move to Today';

    document.getElementById('act-routine').style.display = settings[0] === 3 ? 'none' : 'flex';

    document.getElementById('act-archive').querySelector('.act-icon').nextSibling.textContent =
        settings[0] === 2 ? ' Unarchive' : ' Archive';

    overlay.style.display = 'block';
    sheet.style.display   = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.add('open');
        sheet.classList.add('open');
    }));
}

function closeActionSheet() {
    const sheet   = document.getElementById('action-sheet');
    const overlay = document.getElementById('action-overlay');
    overlay.classList.remove('open');
    sheet.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
        sheet.style.display   = 'none';
        actionContext = null;
    }, 10);
}

document.getElementById('act-today').addEventListener('click', () => {
    if (!actionContext) return;
    const { list, index, splitTask } = actionContext;
    closeActionSheet();
    if (settings[0] === 0 || settings[0] === 2) {
        const src = getListArray(list);
        todaysTasks.push(src[index]); src.splice(index, 1);
    } else if (settings[0] === 3) {
        todaysTasks.push(routineTasks[index]); routineTasks.splice(index, 1);
    } else {
        const dest = quadrantFor(splitTask);
        dest.push(todaysTasks[index]); todaysTasks.splice(index, 1);
    }
    haptic('light');
    saveTasks(); displayTasks();
});

document.getElementById('act-routine').addEventListener('click', () => {
    if (!actionContext) return;
    const { list, index } = actionContext;
    closeActionSheet();
    if (settings[0] === 0 || settings[0] === 2) {
        const src = getListArray(list);
        routineTasks.push(src[index]); src.splice(index, 1);
    } else if (settings[0] === 1) {
        routineTasks.push(todaysTasks[index]); todaysTasks.splice(index, 1);
    }
    haptic('light');
    saveTasks(); displayTasks();
});

document.getElementById('act-archive').addEventListener('click', () => {
    if (!actionContext) return;
    const { list, index, splitTask } = actionContext;
    closeActionSheet();
    const src = getListArray(list, true);
    if (settings[0] === 0) {
        const dest = archivedFor(list); dest.push(src[index]); src.splice(index, 1);
    } else if (settings[0] === 1) {
        const dest = quadrantFor(splitTask, true); dest.push(todaysTasks[index]); todaysTasks.splice(index, 1);
    } else if (settings[0] === 2) {
        const dest = quadrantFor(splitTask, false); dest.push(src[index]); src.splice(index, 1);
    } else if (settings[0] === 3) {
        const dest = quadrantFor(splitTask, true); dest.push(routineTasks[index]); routineTasks.splice(index, 1);
    }
    haptic('light');
    saveTasks(); displayTasks();
});

document.getElementById('act-edit').addEventListener('click', () => {
    if (!actionContext) return;
    const { list, index, taskStr } = actionContext;
    const listArr = getListArray(list, true);
    closeActionSheet();
    setTimeout(() => openModal({ index, list: listArr, taskStr }), 50);
});

document.getElementById('act-delete').addEventListener('click', () => {
    if (!actionContext) return;
    const { list, index } = actionContext;
    const src = getListArray(list, true);
    closeActionSheet();
    src.splice(index, 1);
    haptic('medium');
    saveTasks(); displayTasks();
    showToast('Task deleted');
});

/* ══════════════════════════════════════════════════
   DISPLAY TASKS
══════════════════════════════════════════════════ */
function displayTasks() {
    [quadrant1, quadrant2, quadrant3, quadrant4, singlelist].forEach(q => q.innerHTML = '');
    focusedTaskIndex = -1;
    focusedTaskList  = null;

    const lists = views[settings[0]];

    for (let i = 0; i < lists.length; i++) {
        for (let j = 0; j < lists[i].length; j++) {
            const taskStr = lists[i][j];
            const parts   = taskStr.split('|');
            const index   = j;

            let list;
            if (settings[0] === 0 || settings[0] === 2) {
                list = [quadrant1, quadrant2, quadrant3, quadrant4][i];
            } else {
                list = singlelist;
            }

            const li = document.createElement('li');
            li.className = 'taskli';
            li.draggable = !isMobile();
            li.tabIndex  = 0;  // keyboard focusable

            // Drag & drop (desktop)
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover',  handleDragOver);
            li.addEventListener('drop',      handleDrop);
            li.addEventListener('dragend',   handleDragEnd);

            list.appendChild(li);

            const hasDeadline = parts[1] !== '';
            const hasSchedule = parts[2] !== '';
            const hasImpact   = parts[3] === '/';
            const isUrgent    = hasDeadline && hasImpact;

            // ── DESKTOP columns ──
            if (settings[0] === 1 || settings[0] === 3) {
                const d = document.createElement('div');
                d.className = 'col-info priority-icon';
                d.textContent = isUrgent ? '‼️' : (!hasDeadline && hasImpact ? '⭐' : '');
                li.appendChild(d);
            }
            if (hasDeadline || settings[0] === 1 || settings[0] === 3) {
                const d = document.createElement('div');
                d.textContent = parts[1];
                d.className = 'col-info';
                li.appendChild(d);
            }
            const ds = document.createElement('div');
            ds.textContent = parts[2];
            ds.className = 'col-info sched-col';
            li.appendChild(ds);

            const dt = document.createElement('div');
            dt.textContent = parts[0];
            dt.className = 'col-task';
            li.appendChild(dt);

            const du = document.createElement('div');
            du.className = 'col-update';
            li.appendChild(du);
            buildDesktopActions(du, list, index, parts, taskStr);

            // ── MOBILE swipe row ──
            const swipeWrap = document.createElement('div');
            swipeWrap.className = 'swipe-wrap';

            const swipeActions = document.createElement('div');
            swipeActions.className = 'swipe-actions';

            const swipeTodayBtn = document.createElement('button');
            swipeTodayBtn.className = 'swipe-btn swipe-today';
            swipeTodayBtn.textContent = settings[0] === 1 ? '↩' : '◎';
            swipeTodayBtn.title = settings[0] === 1 ? 'Back' : 'Today';
            swipeTodayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetSwipe(li);
                if (settings[0] === 0 || settings[0] === 2) {
                    const src = getListArray(list);
                    todaysTasks.push(src[index]); src.splice(index, 1);
                } else if (settings[0] === 3) {
                    todaysTasks.push(routineTasks[index]); routineTasks.splice(index, 1);
                } else {
                    const dest = quadrantFor(parts);
                    dest.push(todaysTasks[index]); todaysTasks.splice(index, 1);
                }
                haptic('light');
                saveTasks(); displayTasks();
            });

            const swipeArchiveBtn = document.createElement('button');
            swipeArchiveBtn.className = 'swipe-btn swipe-archive';
            swipeArchiveBtn.textContent = settings[0] === 2 ? '↑' : '⊡';
            swipeArchiveBtn.title = settings[0] === 2 ? 'Unarchive' : 'Archive';
            swipeArchiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetSwipe(li);
                const src = getListArray(list, true);
                if (settings[0] === 0) {
                    const dest = archivedFor(list); dest.push(src[index]); src.splice(index, 1);
                } else if (settings[0] === 1) {
                    const dest = quadrantFor(parts, true); dest.push(todaysTasks[index]); todaysTasks.splice(index, 1);
                } else if (settings[0] === 2) {
                    const dest = quadrantFor(parts, false); dest.push(src[index]); src.splice(index, 1);
                } else if (settings[0] === 3) {
                    const dest = quadrantFor(parts, true); dest.push(routineTasks[index]); routineTasks.splice(index, 1);
                }
                haptic('light');
                saveTasks(); displayTasks();
            });

            const swipeDeleteBtn = document.createElement('button');
            swipeDeleteBtn.className = 'swipe-btn swipe-delete';
            swipeDeleteBtn.textContent = '×';
            swipeDeleteBtn.title = 'Delete';
            swipeDeleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const src = getListArray(list, true);
                src.splice(index, 1);
                haptic('medium');
                saveTasks(); displayTasks();
                showToast('Task deleted');
            });

            swipeActions.appendChild(swipeTodayBtn);
            swipeActions.appendChild(swipeArchiveBtn);
            swipeActions.appendChild(swipeDeleteBtn);

            // ── MOBILE compact card ──
            const card = document.createElement('div');
            card.className = 'mob-card';

            const nameEl = document.createElement('div');
            nameEl.className = 'mob-task-name';
            nameEl.textContent = parts[0];
            card.appendChild(nameEl);

            if (hasDeadline || hasSchedule || hasImpact) {
                const metaEl = document.createElement('div');
                metaEl.className = 'mob-task-meta';
                const dot = document.createElement('span');
                dot.className = 'mob-priority-dot' +
                    (hasImpact ? ' has-impact' : '') +
                    (isUrgent  ? ' urgent'     : '');
                metaEl.appendChild(dot);
                if (hasDeadline) {
                    const chip = document.createElement('span');
                    chip.className = 'mob-meta-chip';
                    chip.textContent = parts[1];
                    metaEl.appendChild(chip);
                }
                if (hasSchedule) {
                    const chip = document.createElement('span');
                    chip.className = 'mob-meta-chip';
                    chip.textContent = parts[2];
                    metaEl.appendChild(chip);
                }
                card.appendChild(metaEl);
            }

            swipeWrap.appendChild(card);
            swipeWrap.appendChild(swipeActions);
            li.appendChild(swipeWrap);

            // ── Touch: long-press → action sheet, swipe-left → reveal actions ──
            attachTouchBehavior(li, list, index, taskStr, parts);

            // ── Keyboard: focus/blur styling ──
            li.addEventListener('focus', () => {
                focusedTaskIndex = index;
                focusedTaskList  = list;
                li.classList.add('kb-focused');
            });
            li.addEventListener('blur', () => {
                li.classList.remove('kb-focused');
            });
        }
    }
}

/* ══════════════════════════════════════════════════
   SWIPE BEHAVIOR  (mobile)
   Swipe-left  → reveal 3 quick-action buttons
   Long-press  → open action sheet
   Tap         → open action sheet
══════════════════════════════════════════════════ */
let currentSwipedLi = null;

function resetSwipe(li) {
    const wrap = li.querySelector('.swipe-wrap');
    if (wrap) wrap.style.transform = '';
    if (currentSwipedLi === li) currentSwipedLi = null;
    li.classList.remove('swiped');
}

function resetAllSwipes(except) {
    document.querySelectorAll('.taskli.swiped').forEach(el => {
        if (el !== except) resetSwipe(el);
    });
}

function attachTouchBehavior(li, list, index, taskStr, parts) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let longPressTimer = null;
    let didSwipe = false;
    let didLongPress = false;
    const SWIPE_THRESHOLD   = 48;   // px to reveal actions
    const SWIPE_FULL        = 120;  // px fully open
    const LONGPRESS_MS      = 480;

    li.addEventListener('touchstart', (e) => {
        touchStartX    = e.touches[0].clientX;
        touchStartY    = e.touches[0].clientY;
        touchStartTime = Date.now();
        didSwipe       = false;
        didLongPress   = false;

        longPressTimer = setTimeout(() => {
            didLongPress = true;
            haptic('medium');
            openActionSheet({ list, index, taskStr, splitTask: parts });
        }, LONGPRESS_MS);
    }, { passive: true });

    li.addEventListener('touchmove', (e) => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;

        // Cancel long-press if moving
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            clearTimeout(longPressTimer);
        }

        // Horizontal swipe only
        if (Math.abs(dx) < Math.abs(dy) * 0.8) return;

        didSwipe = true;
        const wrap = li.querySelector('.swipe-wrap');
        if (!wrap) return;

        // Only allow left swipe
        const clamped = Math.max(-SWIPE_FULL, Math.min(0, dx));
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            resetAllSwipes(li);
        }
        wrap.style.transform = `translateX(${clamped}px)`;
    }, { passive: true });

    li.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimer);
        if (didLongPress) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const dt = Date.now() - touchStartTime;
        const wrap = li.querySelector('.swipe-wrap');

        if (didSwipe && Math.abs(dx) > Math.abs(dy)) {
            // Decide: snap open or snap closed
            if (dx < -SWIPE_THRESHOLD) {
                // Snap open
                if (wrap) wrap.style.transform = `translateX(-${SWIPE_FULL}px)`;
                li.classList.add('swiped');
                currentSwipedLi = li;
                haptic('light');
            } else {
                resetSwipe(li);
            }
        } else if (!didSwipe && dt < 400 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            // Pure tap — if already swiped open, close it; else open action sheet
            if (li.classList.contains('swiped')) {
                resetSwipe(li);
            } else {
                resetAllSwipes(li);
                openActionSheet({ list, index, taskStr, splitTask: parts });
            }
        }
    }, { passive: true });
}

/* ══════════════════════════════════════════════════
   BOTTOM NAV SWIPE  (mobile — swipe content area)
══════════════════════════════════════════════════ */
(function attachContentSwipe() {
    const content = document.getElementById('content');
    let sx = 0, sy = 0;
    content.addEventListener('touchstart', e => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
    }, { passive: true });
    content.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        // Only horizontal flick (dx dominant, fast enough)
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        // Don't fire if a swipe-action is open
        if (currentSwipedLi) { resetAllSwipes(null); return; }
        if (dx < 0) {
            switchView(settings[0] < 3 ? settings[0] + 1 : 0);
        } else {
            switchView(settings[0] > 0 ? settings[0] - 1 : 3);
        }
        haptic('light');
    }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   SHEET DRAG-TO-CLOSE  (mobile)
══════════════════════════════════════════════════ */
(function attachSheetDrag() {
    ['modal-sheet', 'action-sheet'].forEach(id => {
        const el = document.getElementById(id);
        let startY = 0;
        let dragging = false;

        el.addEventListener('touchstart', e => {
            startY   = e.touches[0].clientY;
            dragging = true;
        }, { passive: true });

        el.addEventListener('touchmove', e => {
            if (!dragging) return;
            const dy = e.touches[0].clientY - startY;
            if (dy > 0) {
                el.style.transform = `translateY(${dy}px)`;
            }
        }, { passive: true });

        el.addEventListener('touchend', e => {
            dragging = false;
            const dy = e.changedTouches[0].clientY - startY;
            el.style.transform = '';
            if (dy > 80) {
                haptic('light');
                closeModal();
                closeActionSheet();
            }
        }, { passive: true });
    });
})();

/* ══════════════════════════════════════════════════
   BUILD DESKTOP ACTION BUTTONS
══════════════════════════════════════════════════ */
function buildDesktopActions(container, list, index, splitTask, taskStr) {
    const todayBtn = makeActionBtn('T', settings[0] === 1 ? 'Back to All  [T]' : 'Today  [T]', false, () => {
        if (settings[0] === 0 || settings[0] === 2) {
            const src = getListArray(list);
            todaysTasks.push(src[index]); src.splice(index, 1);
        } else if (settings[0] === 3) {
            todaysTasks.push(routineTasks[index]); routineTasks.splice(index, 1);
        } else {
            const dest = quadrantFor(splitTask);
            dest.push(todaysTasks[index]); todaysTasks.splice(index, 1);
        }
        saveTasks(); displayTasks();
    });
    container.appendChild(todayBtn);

    if (settings[0] !== 3) {
        const routineBtn = makeActionBtn('R', 'Routine  [R]', false, () => {
            if (settings[0] === 0 || settings[0] === 2) {
                const src = getListArray(list);
                routineTasks.push(src[index]); src.splice(index, 1);
            } else if (settings[0] === 1) {
                routineTasks.push(todaysTasks[index]); todaysTasks.splice(index, 1);
            }
            saveTasks(); displayTasks();
        });
        container.appendChild(routineBtn);
    }

    const archiveBtn = makeActionBtn('A', (settings[0] === 2 ? 'Unarchive' : 'Archive') + '  [A]', false, () => {
        const src = getListArray(list, true);
        if (settings[0] === 0) {
            const dest = archivedFor(list); dest.push(src[index]); src.splice(index, 1);
        } else if (settings[0] === 1) {
            const dest = quadrantFor(splitTask, true); dest.push(todaysTasks[index]); todaysTasks.splice(index, 1);
        } else if (settings[0] === 2) {
            const dest = quadrantFor(splitTask, false); dest.push(src[index]); src.splice(index, 1);
        } else if (settings[0] === 3) {
            const dest = quadrantFor(splitTask, true); dest.push(routineTasks[index]); routineTasks.splice(index, 1);
        }
        saveTasks(); displayTasks();
    });
    container.appendChild(archiveBtn);

    const editBtn = makeActionBtn('E', 'Edit  [E]', false, () => {
        const src = getListArray(list, true);
        const p   = src[index].split('|');
        document.getElementById('f-task').value     = p[0] || '';
        document.getElementById('f-deadline').value = p[1] || '';
        document.getElementById('f-schedule').value = p[2] || '';
        if ((p[3] === '/') !== desktopImpact) toggleImpact();
        src.splice(index, 1);
        saveTasks(); displayTasks();
        document.getElementById('f-task').focus();
    });
    container.appendChild(editBtn);

    const deleteBtn = makeActionBtn('×', 'Delete  [Del]', true, () => {
        const src = getListArray(list, true);
        src.splice(index, 1);
        saveTasks(); displayTasks();
    });
    container.appendChild(deleteBtn);
}

function makeActionBtn(text, title, isDanger, handler) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    btn.className = 'col-update-buttons' + (isDanger ? ' danger' : '');
    btn.addEventListener('click', (e) => { e.stopPropagation(); handler(); });
    return btn;
}

/* ─── List array helpers ─── */
function getListArray(listEl) {
    if (listEl === quadrant1) return views[settings[0]][0];
    if (listEl === quadrant2) return views[settings[0]][1];
    if (listEl === quadrant3) return views[settings[0]][2];
    if (listEl === quadrant4) return views[settings[0]][3];
    if (settings[0] === 1)   return todaysTasks;
    return routineTasks;
}

function quadrantFor(splitTask, archived) {
    const hasDeadline = splitTask[1] !== '';
    const hasImpact   = splitTask[3] === '/';
    if (hasDeadline && hasImpact)  return archived ? archivedTasksQuadrant1 : allTasksQuadrant1;
    if (!hasDeadline && hasImpact) return archived ? archivedTasksQuadrant2 : allTasksQuadrant2;
    if (hasDeadline && !hasImpact) return archived ? archivedTasksQuadrant3 : allTasksQuadrant3;
    return archived ? archivedTasksQuadrant4 : allTasksQuadrant4;
}

function archivedFor(listEl) {
    if (listEl === quadrant1) return archivedTasksQuadrant1;
    if (listEl === quadrant2) return archivedTasksQuadrant2;
    if (listEl === quadrant3) return archivedTasksQuadrant3;
    return archivedTasksQuadrant4;
}

/* ══════════════════════════════════════════════════
   SAVE
══════════════════════════════════════════════════ */
function saveTasks() {
    localStorage.setItem('todaysTasks',            JSON.stringify(todaysTasks));
    localStorage.setItem('allTasksQuadrant1',      JSON.stringify(allTasksQuadrant1));
    localStorage.setItem('allTasksQuadrant2',      JSON.stringify(allTasksQuadrant2));
    localStorage.setItem('allTasksQuadrant3',      JSON.stringify(allTasksQuadrant3));
    localStorage.setItem('allTasksQuadrant4',      JSON.stringify(allTasksQuadrant4));
    localStorage.setItem('archivedTasksQuadrant1', JSON.stringify(archivedTasksQuadrant1));
    localStorage.setItem('archivedTasksQuadrant2', JSON.stringify(archivedTasksQuadrant2));
    localStorage.setItem('archivedTasksQuadrant3', JSON.stringify(archivedTasksQuadrant3));
    localStorage.setItem('archivedTasksQuadrant4', JSON.stringify(archivedTasksQuadrant4));
    localStorage.setItem('routineTasks',           JSON.stringify(routineTasks));
}

/* ══════════════════════════════════════════════════
   DRAG & DROP  (desktop)
══════════════════════════════════════════════════ */
let draggedIndex = null;

function handleDragStart(e) {
    draggedIndex = Array.from(this.parentNode.children).indexOf(this);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over'));
    this.classList.add('drag-over');
}
function handleDrop(e) {
    e.preventDefault();
    document.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over'));
    const targetIdx = Array.from(this.parentNode.children).indexOf(this);
    const listEl    = this.parentNode;
    let listIndex;
    if (settings[0] === 0 || settings[0] === 2) {
        listIndex = listEl === quadrant1 ? 0 : listEl === quadrant2 ? 1 : listEl === quadrant3 ? 2 : 3;
    } else { listIndex = 0; }
    if (draggedIndex !== targetIdx) {
        const arr = views[settings[0]][listIndex];
        const [moved] = arr.splice(draggedIndex, 1);
        arr.splice(targetIdx, 0, moved);
        saveTasks(); displayTasks();
    }
}
function handleDragEnd() {
    draggedIndex = null;
    document.querySelectorAll('.dragging').forEach(x => x.classList.remove('dragging'));
    document.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over'));
}

/* ══════════════════════════════════════════════════
   SWITCH VIEW
══════════════════════════════════════════════════ */
function switchView(x) {
    const isMatrix = (x === 0 || x === 2);
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    ['btn-Eis','btn-Tdy','btn-Arc','btn-Rou'][x] && document.getElementById(['btn-Eis','btn-Tdy','btn-Arc','btn-Rou'][x])?.classList.add('active');
    document.querySelectorAll('.mob-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(['mob-btn-Eis','mob-btn-Tdy','mob-btn-Arc','mob-btn-Rou'][x])?.classList.add('active');
    document.getElementById('view-matrix').style.display     = isMatrix ? 'flex' : 'none';
    document.getElementById('view-singlelist').style.display = isMatrix ? 'none' : 'flex';
    document.getElementById('view-name').textContent     = viewMeta[x].name;
    document.getElementById('view-subtitle').textContent = viewMeta[x].subtitle;
    settings[0] = x;
    localStorage.setItem('settings', JSON.stringify(settings));
    displayTasks();
}

/* ══════════════════════════════════════════════════
   COPY
══════════════════════════════════════════════════ */
function copyTasks() {
    const lines = [];
    views[settings[0]].forEach(list => list.forEach(t => lines.push('- ' + t.split('|')[0])));
    const text = lines.join('\n');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('Copied ✓'));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        showToast('Copied ✓');
    }
}

/* ══════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════ */
function setDarkMode() {
    document.body.classList.remove('light');
    document.getElementById('darkModeBtn').style.display  = 'none';
    document.getElementById('lightModeBtn').style.display = '';
    settings[1] = true;
    localStorage.setItem('settings', JSON.stringify(settings));
}
function setLightMode() {
    document.body.classList.add('light');
    document.getElementById('lightModeBtn').style.display = 'none';
    document.getElementById('darkModeBtn').style.display  = '';
    settings[1] = false;
    localStorage.setItem('settings', JSON.stringify(settings));
}
function toggleTheme() { settings[1] ? setLightMode() : setDarkMode(); }

/* ══════════════════════════════════════════════════
   CLOCK
══════════════════════════════════════════════════ */
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
function updateClock() {
    const n = new Date();
    document.getElementById('date').textContent = MONTHS[n.getMonth()] + ' ' + n.getDate();
    document.getElementById('day').textContent  = DAYS[n.getDay()];
    let h = n.getHours(), ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    document.getElementById('time').textContent = h + ':' + String(n.getMinutes()).padStart(2,'0') + ' ' + ampm;
}
updateClock();
setInterval(updateClock, 1000);

/* ══════════════════════════════════════════════════
   KEYBOARD SHORTCUTS HELP OVERLAY
══════════════════════════════════════════════════ */
function toggleHelp() {
    const panel   = document.getElementById('kb-help');
    const overlay = document.getElementById('kb-help-overlay');
    const isOpen  = panel.classList.toggle('open');
    overlay.style.display = isOpen ? 'block' : 'none';
}
document.getElementById('kb-help-overlay').addEventListener('click', () => {
    document.getElementById('kb-help').classList.remove('open');
    document.getElementById('kb-help-overlay').style.display = 'none';
});

/* ══════════════════════════════════════════════════
   KEYBOARD — focused task action helper
   Operates on the currently keyboard-focused task
══════════════════════════════════════════════════ */
function getFocusedTaskCtx() {
    const el = document.activeElement;
    if (!el || !el.classList.contains('taskli')) return null;
    const list  = el.parentNode;
    const index = Array.from(list.children).indexOf(el);
    const arr   = getListArray(list);
    if (index < 0 || index >= arr.length) return null;
    const taskStr  = arr[index];
    const splitTask = taskStr.split('|');
    return { el, list, listArr: arr, index, taskStr, splitTask };
}

function kbFocusTask(direction) {
    // direction: +1 or -1
    const el = document.activeElement;
    if (el && el.classList.contains('taskli')) {
        const items = Array.from(el.parentNode.querySelectorAll('.taskli'));
        const i = items.indexOf(el);
        const next = items[i + direction];
        if (next) { next.focus(); return; }
        // wrap to other quadrant / list on matrix views
    }
    // Focus first task in current view
    const first = document.querySelector('.taskli');
    if (first) first.focus();
}

/* ══════════════════════════════════════════════════
   KEYBOARD EVENT HANDLER
══════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    const tag    = e.target.tagName;
    const inInput = (tag === 'INPUT' || tag === 'TEXTAREA');
    const inDesktopInput = ['f-task','f-deadline','f-schedule'].includes(e.target.id);
    const inMobileInput  = ['m-task','m-deadline','m-schedule'].includes(e.target.id);
    const helpOpen = document.getElementById('kb-help').classList.contains('open');

    // ── Escape always closes overlays ──
    if (e.key === 'Escape') {
        if (helpOpen) { document.getElementById('kb-help').classList.remove('open'); return; }
        closeModal(); closeActionSheet();
        document.activeElement?.blur();
        return;
    }

    // ── ? opens help ──
    if (e.key === '?' && !inInput) {
        e.preventDefault(); toggleHelp(); return;
    }

    // ── Inside desktop form inputs ──
    if (inDesktopInput) {
        if (e.key === 'Enter') { e.preventDefault(); submitDesktopForm(); }
        // Tab is handled by browser natively — correct order
        return;
    }

    // ── Impact toggle reachable by Tab then Space/Enter ──
    if (e.target.id === 'f-impact' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault(); toggleImpact(); return;
    }

    // ── Inside mobile modal inputs ──
    if (inMobileInput) {
        if (e.key === 'Enter') { e.preventDefault(); submitMobileForm(); }
        return;
    }

    // ── Shortcuts that need a focused task ──
    const ctx = getFocusedTaskCtx();
    if (ctx && !inInput) {
        switch (e.key) {
            case 'e': case 'E':
                e.preventDefault();
                if (!isMobile()) {
                    const p = ctx.splitTask;
                    document.getElementById('f-task').value     = p[0] || '';
                    document.getElementById('f-deadline').value = p[1] || '';
                    document.getElementById('f-schedule').value = p[2] || '';
                    if ((p[3] === '/') !== desktopImpact) toggleImpact();
                    ctx.listArr.splice(ctx.index, 1);
                    saveTasks(); displayTasks();
                    document.getElementById('f-task').focus();
                } else {
                    openModal({ index: ctx.index, list: ctx.listArr, taskStr: ctx.taskStr });
                }
                return;
            case 't': case 'T':
                // T on a focused task = move to today; T elsewhere = toggle theme
                if (ctx) {
                    e.preventDefault();
                    if (settings[0] === 0 || settings[0] === 2) {
                        const src = getListArray(ctx.list);
                        todaysTasks.push(src[ctx.index]); src.splice(ctx.index, 1);
                    } else if (settings[0] === 3) {
                        todaysTasks.push(routineTasks[ctx.index]); routineTasks.splice(ctx.index, 1);
                    } else {
                        const dest = quadrantFor(ctx.splitTask);
                        dest.push(todaysTasks[ctx.index]); todaysTasks.splice(ctx.index, 1);
                    }
                    saveTasks(); displayTasks();
                    return;
                }
                break;
            case 'r': case 'R':
                e.preventDefault();
                if (settings[0] === 0 || settings[0] === 2) {
                    const src = getListArray(ctx.list);
                    routineTasks.push(src[ctx.index]); src.splice(ctx.index, 1);
                } else if (settings[0] === 1) {
                    routineTasks.push(todaysTasks[ctx.index]); todaysTasks.splice(ctx.index, 1);
                }
                saveTasks(); displayTasks(); return;
            case 'a': case 'A':
                e.preventDefault(); {
                    const src = getListArray(ctx.list, true);
                    if (settings[0] === 0) {
                        const dest = archivedFor(ctx.list); dest.push(src[ctx.index]); src.splice(ctx.index, 1);
                    } else if (settings[0] === 1) {
                        const dest = quadrantFor(ctx.splitTask, true); dest.push(todaysTasks[ctx.index]); todaysTasks.splice(ctx.index, 1);
                    } else if (settings[0] === 2) {
                        const dest = quadrantFor(ctx.splitTask, false); dest.push(src[ctx.index]); src.splice(ctx.index, 1);
                    } else if (settings[0] === 3) {
                        const dest = quadrantFor(ctx.splitTask, true); dest.push(routineTasks[ctx.index]); routineTasks.splice(ctx.index, 1);
                    }
                    saveTasks(); displayTasks(); return;
                }
            case 'Delete': case 'Backspace':
                e.preventDefault(); {
                    const src = getListArray(ctx.list, true);
                    src.splice(ctx.index, 1);
                    saveTasks(); displayTasks();
                    showToast('Task deleted');
                    return;
                }
            case 'ArrowUp':
                e.preventDefault(); kbFocusTask(-1); return;
            case 'ArrowDown':
                e.preventDefault(); kbFocusTask(+1); return;
        }
    }

    // ── Global shortcuts (no focused task) ──
    if (inInput) return;

    switch (e.key) {
        case 'n': case 'N':
            e.preventDefault();
            if (!isMobile()) document.getElementById('f-task')?.focus();
            else openModal();
            break;
        case 'Enter': case ' ':
            e.preventDefault();
            if (!isMobile()) document.getElementById('f-task')?.focus();
            else openModal();
            break;
        case '1': e.preventDefault(); switchView(0); break;
        case '2': e.preventDefault(); switchView(1); break;
        case '3': e.preventDefault(); switchView(2); break;
        case '4': e.preventDefault(); switchView(3); break;
        case 'ArrowLeft':
            e.preventDefault();
            switchView(settings[0] > 0 ? settings[0] - 1 : 3); break;
        case 'ArrowRight':
            e.preventDefault();
            switchView(settings[0] < 3 ? settings[0] + 1 : 0); break;
        case 't': case 'T':
            e.preventDefault(); toggleTheme(); break;
        case 'c': case 'C':
            e.preventDefault(); copyTasks(); break;
        case 'ArrowUp':
            e.preventDefault(); kbFocusTask(-1); break;
        case 'ArrowDown':
            e.preventDefault(); kbFocusTask(+1); break;
    }
});
