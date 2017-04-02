
function Dragond(initialContainers, options) {
  options = options || {};
  const $rootElement = $(options.rootElement || 'body');
  let $shadowElement;

  const dnd = new Dnd(initialContainers, {
    start, end, over, enter, leave, drop,
  });

  function start(e, el, src) {
    $rootElement.addClass('dg-dragging');
    createShadow(el);
    $(el).addClass('dg-dragged');
    options.start && options.start.call(el, e, el, src);
  }

  function end(e, el, con, src) {
    $rootElement.removeClass('dg-dragging')
    $(el).removeClass('dg-dragged');
    options.end && options.end.call(this);
    $shadowElement.remove();
  }

  function over(e, el, con, src) {
    options.over && options.over.call(this);
  }

  function enter(e, el, con, src) {
    options.enter && options.enter.call(this);
  }

  function leave(e, el, con, src) {
    options.leave && options.leave.call(this);
  }

  function drop(e, el, con, src) {
    options.drop && options.drop.call(this);
  }

  function createShadow(el) {
    const rect = el.getBoundingClientRect();
    const clone = el.cloneNode(true);
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.classList.add('dg-shadow');
    $shadowElement = $(clone).appendTo($rootElement);
  }
}

function Dnd(initialContainers, options) {
  options = options || {};
  let containers = initialContainers || [];
  let draggedElement, lastContainer, sourceContainer;

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
      draggedElement = e.target;
      lastContainer = sourceContainer = container;
      trigger('start', draggedElement, e, draggedElement, sourceContainer);
      trigger('enter', container, e, draggedElement, container, sourceContainer);
    });
  }

  function dragend(e) {
    lastContainer && trigger('leave', lastContainer, e, draggedElement, lastContainer, sourceContainer);
    trigger('end', draggedElement, e, draggedElement, lastContainer, sourceContainer);
    draggedElement = lastContainer = sourceContainer = null;
  }

  function drag(e) {
  }

  function dragenter(e) {
    processContainer(e.target, function(container) {
      if (container !== lastContainer) {
        lastContainer = container;
        trigger('enter', container, e, draggedElement, container, sourceContainer);
      }
    });
  }

  function dragleave(e) {
    processContainer(e.target, function(container) {
      if (container !== lastContainer || !overElement(e, container)) {
        if (container === lastContainer) {
          lastContainer = null;
        }
        trigger('leave', container, e, draggedElement, container, sourceContainer);
      }
    });
  }

  function dragover(e) {
    processContainer(e.target, function(container) {
      e.preventDefault();
      trigger('over', container, e, draggedElement, container, sourceContainer);
    });
  }

  function drop(e) {
    processContainer(e.target, function(container) {
      trigger('drop', container, e, draggedElement, container, sourceContainer);
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

  function trigger(event) {
    if (options[event]) {
      const obj = arguments[1];
      const args = Array.prototype.slice.call(arguments, 2);
      options[event].apply(obj, args);
    }
  }
}
