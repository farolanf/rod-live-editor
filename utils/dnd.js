
function Dragond(initialContainers, options) {
  options = options || {};
  let shadowElement, offsetX, offsetY, screenOffsetX, screenOffsetY;
  const shadowContainer = document.body;
  const nullImg = document.createElement('IMG');

  const dnd = new Dnd(initialContainers, {
    start, end, drag, over, enter, leave, drop,
  });

  return dnd;

  function start(e, el, src) {
    calcOffsets(e, el);
    createShadow(el);
    $(el).addClass('dg-dragged');
    dnd.$body.addClass('dg-dragging');
    e.dataTransfer.setDragImage(nullImg, null, null);
    options.start && options.start.call(el, e, el, src);
  }

  function end(e, el, con, src) {
    $(el).removeClass('dg-dragged');
    dnd.$body.removeClass('dg-dragging')
    options.end && options.end.call(this);
    shadowElement.parentNode.removeChild(shadowElement);
  }

  function drag(e, el, con, src) {
    dragShadow(e);
    options.drag && options.drag.call(this);
  }

  function over(e, el, con, src) {
    // console.log(con);
    if (el.parentNode !== con) {
      $(con).prepend(el);
    }
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
    clone.removeAttribute('draggable');
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.classList.add('dg-shadow');
    shadowContainer.append(clone);
    shadowElement = clone;
  }

  function dragShadow(e) {
    shadowElement.style.left = `${e.screenX - screenOffsetX - offsetX}px`;
    shadowElement.style.top = `${e.screenY - screenOffsetY - offsetY}px`;
  }

  function calcOffsets(e, el) {
    screenOffsetX = e.screenX - e.clientX;
    screenOffsetY = e.screenY - e.clientY;
    const rect = el.getBoundingClientRect();    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  }
}

function Dnd(initialContainers, options) {
  options = options || {};
  let containers = initialContainers || [];
  let draggedElement, lastContainer, sourceContainer;
  const $body = $();

  initContainers();
  events(window);

  return {
    $body,
    addIframe,
    addContainers,
    set containers(c) {containers = c; initContainers()},
  };

  function events(win) {
    $body.push(win.document.body);
    $(win).on('dragstart', dragstart)
      .on('dragend', dragend)
      .on('drag', drag)
      .on('dragover', dragover)
      .on('dragenter', dragenter)
      .on('dragleave', dragleave)
      .on('drop', drop);
    console.log($body.toArray());
  }

  function addIframe(selector) {
    $(selector).each(function() {
      if ($(this).is('iframe')) {
        events(this.contentWindow);
      }
    });
  }

  function dragstart(event) {
    const e = event.originalEvent;
    processContainer(e.target, function(container) {
      draggedElement = e.target;
      lastContainer = sourceContainer = container;
      trigger('start', draggedElement, e, draggedElement, sourceContainer);
      trigger('enter', container, e, draggedElement, container, sourceContainer);
    });
  }

  function dragend(event) {
    const e = event.originalEvent;
    lastContainer && trigger('leave', lastContainer, e, draggedElement, lastContainer, sourceContainer);
    trigger('end', draggedElement, e, draggedElement, lastContainer, sourceContainer);
    draggedElement = lastContainer = sourceContainer = null;
  }

  function drag(event) {
    const e = event.originalEvent;
    trigger('drag', draggedElement, e, draggedElement, lastContainer, sourceContainer);
  }

  function dragenter(event) {
    const e = event.originalEvent;
    processContainer(e.target, function(container) {
      if (container !== lastContainer) {
        lastContainer = container;
        trigger('enter', container, e, draggedElement, container, sourceContainer);
      }
    });
  }

  function dragleave(event) {
    const e = event.originalEvent;
    processContainer(e.target, function(container) {
      if (container !== lastContainer || !overElement(e, container)) {
        if (container === lastContainer) {
          lastContainer = null;
        }
        trigger('leave', container, e, draggedElement, container, sourceContainer);
      }
    });
  }

  function dragover(event) {
    // console.log(event.target);
    const e = event.originalEvent;
    processContainer(e.target, function(container) {
      e.preventDefault();
      trigger('over', container, e, draggedElement, container, sourceContainer);
    });
  }

  function drop(event) {
    const e = event.originalEvent;
    processContainer(e.target, function(container) {
      trigger('drop', container, e, draggedElement, container, sourceContainer);
    });
  }

  function initContainers() {
    containers.forEach(function(c) {
      $(c).children().prop('draggable', 'true');
    });
  }

  function addContainers() {
    containers = containers.concat(Array.prototype.slice.call(arguments));
    initContainers();
    console.log(getContainerElements());
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
