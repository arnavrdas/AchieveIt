const DOM = {
  navbar_buttons: {
    gan:        document.getElementById('gan'),
    rou:        document.getElementById('rou'),
    mat:        document.getElementById('mat'),
    tod:        document.getElementById('tod'),
    upc:        document.getElementById('upc'),
  },
  view: {
    chart:      document.getElementById('chart'),
    routine:    document.getElementById('routine'),
    matrix:     document.getElementById('matrix'),
    today:      document.getElementById('today'),
    upcoming:   document.getElementById('upcoming')
  },
  inputBar:     document.getElementById('inputBar')
}

const data = {
  settings: {
    colorMode: {},
  },
  tasks: {
    all: {},
    today: {},
    archive: {}
  }
}