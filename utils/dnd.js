
function Dragond(initialContainers, options) {
  options = options || {};
  const $rootElement = $(options.rootElement || 'body');

  const dnd = new Dnd(initialContainers, {
    start, end, over, enter, leave, drop,
  });

  function start() {
    $rootElement.addClass('dnd-dragging')
    options.start && options.start.call(this);
  }

  function end() {
    $rootElement.removeClass('dnd-dragging')
    options.end && options.end.call(this);
  }

  function over() {
    options.over && options.over.call(this);
  }

  function enter() {
    options.enter && options.enter.call(this);
  }

  function leave() {
    options.leave && options.leave.call(this);
  }

  function drop() {
    options.drop && options.drop.call(this);
  }
}

function Dnd(initialContainers, options) {
  options = options || {};
  let containers = initialContainers || [];
  let lastContainer;

  initContainers();
  events();

  return {
    set containers(c) {containers = c; initContainers()},
  };

  function events() {
    $(window).on('dragstart', dragstart)
      .on('dragend', dragend)
      .on('drag', drag)
      .on('dragover', dragover)
      .on('dragenter', dragenter)
      .on('dragleave', dragleave)
      .on('drop', drop);
  }

  function dragstart(e) {
    processContainer(e.target, function(container) {
      options.enter && options.enter.call(container);
    });
  }

  function dragend(e) {
    lastContainer && options.leave && options.leave.call(lastContainer);
  }

  function drag(e) {
  }

  function dragenter(e) {
    processContainer(e.target, function(container) {
      e.stopPropagation();
      if (container !== lastContainer) {
        lastContainer = container;
        options.enter && options.enter.call(container);
      }
    });
  }

  function dragleave(e) {
    processContainer(e.target, function(container) {
      if (container !== lastContainer || !overElement(e, container)) {
        e.stopPropagation();
        if (container === lastContainer) {
          lastContainer = null;
        }
        options.leave && options.leave.call(container);
      }
    });
  }

  function dragover(e) {
    processContainer(e.target, function(container) {
      e.preventDefault();
      options.over && options.over.call(container);
    });
  }

  function drop(e) {
    processContainer(e.target, function(container) {
      e.stopPropagation();
      options.drop && options.drop.call(container);
    });
  }

  function initContainers() {
    containers.forEach(function(c) {
      $(c).children().prop('draggable', 'true');
    });
  }

  function getContainerElements() {
    return containers.reduce(function(arr, c) {
      return arr.concat($(c).toArray());
    }, []);
  }

  function getOtherContainers(not) {
    return containers.reduce(function(arr, c) {
      return arr.concat($(c).not(not).toArray());
    }, []);
  }

  function findClosestContainer(el) {
    const closestContainer = $(el).closest(getContainerElements());
    if (closestContainer.length > 0) {
      return closestContainer[0];
    }
  }

  function processContainer(el, fn) {
    const containerElement = findClosestContainer(el);
    if (containerElement) {
      fn(containerElement);
    }    
  }

  function overElement(e, el) {
    const x = e.clientX;
    const y = e.clientY;
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
  }
}