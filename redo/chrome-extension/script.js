const DOM = {
    button: {
        matrix:      document.getElementById(' button-matrix     '),
        list:        document.getElementById(' button-list       '),
        archive:     document.getElementById(' button-archive    '),
        copy:        document.getElementById(' button-copy       '),
        light_mode:  document.getElementById(' button-light_mode '),
        dark_mode:   document.getElementById(' button-dark_mode  ')
    },
    input: {
        task:        document.getElementById(' input-task        '),
        textarea:    document.getElementById(' input-textarea    '),
        deadline:    document.getElementById(' input-deadline    '),
        schedule:    document.getElementById(' input-schedule    '),
        impact:      document.getElementById(' input-impact      ')
    },
    view: {
        matrix:      document.getElementById(' view-matrix       '),
        list:        document.getElementById(' view-list         ')
    },
    ul: {
        quadrant1:   document.getElementById(' ul-quadrant1      '),
        quadrant2:   document.getElementById(' ul-quadrant2      '),
        quadrant3:   document.getElementById(' ul-quadrant3      '),
        quadrant4:   document.getElementById(' ul-quadrant4      '),
        list:        document.getElementById(' ul-list           ')
    }
}

const data = {
    settings: {
        current_view:   JSON.parse(localStorage.getItem(' setting-current_view    ')) || [],
        color_mode:     JSON.parse(localStorage.getItem(' setting-color_mode      ')) || []
    },
    tasks: {
        all: {
            quadrant1:  JSON.parse(localStorage.getItem(' tasks-all-quadrant1     ')) || [],
            quadrant2:  JSON.parse(localStorage.getItem(' tasks-all-quadrant2     ')) || [],
            quadrant3:  JSON.parse(localStorage.getItem(' tasks-all-quadrant3     ')) || [],
            quadrant4:  JSON.parse(localStorage.getItem(' tasks-all-quadrant4     ')) || []
        },
        today:          JSON.parse(localStorage.getItem(' tasks-today             ')) || [],
        archive: {
            quadrant1:  JSON.parse(localStorage.getItem(' tasks-archive-quadrant1 ')) || [],
            quadrant2:  JSON.parse(localStorage.getItem(' tasks-archive-quadrant2 ')) || [],
            quadrant3:  JSON.parse(localStorage.getItem(' tasks-archive-quadrant3 ')) || [],
            quadrant4:  JSON.parse(localStorage.getItem(' tasks-archive-quadrant4 ')) || []
        }
    }
}
