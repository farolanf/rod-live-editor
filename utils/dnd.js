
function Dragond(initialContainers, options) {
  const dragShadow = new DragShadow();
  let posX, posY, lastX, lastY, dx, dy, lastPosTimer;

  options = options || {};
  const dndOptions = Object.assign({}, options, {
    start, end, drag, over, enter, leave, drop,
  });
  const dnd = new Dnd(initialContainers, dndOptions);

  updateLastPos();

  return Object.assign({}, dnd, {
    destroy,
  });

  function destroy() {
    clearTimeout(lastPosTimer);
  }

  function start(e, el, src) {
    options.shadow && dragShadow.create(el, e);
    $(el).addClass('dg-dragged');
    dnd.$body.addClass('dg-dragging');
    options.start && options.start.call(el, e, el, src);
  }

  function end(e, el, con, src) {
    $(el).removeClass('dg-dragged');
    dnd.$body.removeClass('dg-dragging')
    options.end && options.end.call(this);
    options.shadow && dragShadow.remove();
  }

  function enter(e, el, con, src) {
    con.classList.add('dg-dragover');
    options.enter && options.enter.call(this);
  }

  function leave(e, el, con, src) {
    con.classList.remove('dg-dragover');
    options.leave && options.leave.call(this);
  }

  function drag(e, el, con, src) {
    options.shadow && dragShadow.drag(e);
    options.drag && options.drag.call(this);
  }

  function over(e, el, con, src) {
    calcDeltaPos(e);
    insert(e, el, con);
    options.over && options.over.call(this);
  }

  function drop(e, el, con, src) {
    options.drop && options.drop.call(this);
  }

  function insert(e, el, con) {
    if (el.parent !== con) {
      if ($.contains(el, con)) {
        return;
      }
      if (e.target === con && con.childElementCount === 0) {
        con.appendChild(el);
      }
      else if (dx !== 0 || dy !== 0) {
        insertElement(e, el);
      }
    }
  }

  function insertElement(e, el) {
    const len = 5;
    const rect = e.target.getBoundingClientRect();
    const left = rect.left + len;
    const right = rect.right - len;
    const top = rect.top + len;
    const bottom = rect.bottom - len;
    const x = e.clientX;
    const y = e.clientY;
    const beforeH = dx < 0;
    const beforeV = dy < 0;
    const allowBeforeH = x < left;
    const allowBeforeV = y < top;
    const allowAfterH = x > right;
    const allowAfterV = y > bottom;
    const sibling = e.target.closest('[draggable]');
    if ((beforeH && allowBeforeH) || (beforeV && allowBeforeV)) {
      $(el).insertBefore(sibling);
    }
    else if ((!beforeH && allowAfterH) || (!beforeV && allowAfterV)) {
      $(el).insertAfter(sibling);
    }
  }

  function calcDeltaPos(e) {
    posX = e.clientX;
    posY = e.clientY;
    dx = posX - lastX;
    dy = posY - lastY;
  }

  // give time between update to support slow dragging
  function updateLastPos() {
    lastX = posX;
    lastY = posY;
    lastPosTimer = setTimeout(updateLastPos, 200);
  }
}

function DragShadow() {
  const shadowContainer = document.body;
  const nullImg = document.createElement('IMG');
  let shadowElement, offsetX, offsetY;

  return {
    create,
    remove,
    drag,
  };

  function create(el, e) {
    calcOffsets(el, e);
    const rect = el.getBoundingClientRect();
    const clone = el.cloneNode(true);
    clone.removeAttribute('draggable');
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.classList.add('dg-shadow');
    shadowContainer.append(clone);
    shadowElement = clone;
    e.dataTransfer.setDragImage(nullImg, null, null);
  }

  function remove() {
    if (shadowElement && shadowElement.parentNode) {
      shadowElement.parentNode.removeChild(shadowElement);
      shadowElement = null;
    }
  }

  function drag(e) {
    if (shadowElement) {
      const pos = domutils.topClientPos(e.clientX, e.clientY, e.view);
      shadowElement.style.left = `${pos.x - offsetX}px`;
      shadowElement.style.top = `${pos.y - offsetY}px`;
    }
  }

  function calcOffsets(el, e) {
    const rect = el.getBoundingClientRect();    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  }
}

function Dnd(initialContainers, options) {
  let containers = initialContainers || [];
  let draggedElement, lastContainer, sourceContainer;
  const $body = $();
  let dragoverTick;

  const defaultOptions = {
    copy: false,
    accepts,
    getElement,
  };
  options = Object.assign({}, defaultOptions, options || {});

  initContainers();
  events(window);
  tick();

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

  function accepts(el, con, src) {
    return true;
  }

  function getElement(el, src) {
    if (options.copy) {
      return el.cloneNode(true);
    }
    return el;
  }

  function tick() {
    dragoverTick = true;
    setTimeout(tick, 50);
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
      draggedElement = options.getElement(e.target, container);
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

  function drag(event) {
    const e = event.originalEvent;
    trigger('drag', draggedElement, e, draggedElement, lastContainer, sourceContainer);
  }

  function dragover(event) {
    if (dragoverTick && 
    options.accepts(draggedElement, lastContainer, sourceContainer)) {
      dragoverTick = false;
      const e = event.originalEvent;
      processContainer(e.target, function(container) {
        e.preventDefault();
        trigger('over', container, e, draggedElement, container, sourceContainer);
      });
    }
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

function dumpPos(e) {
  console.log(e.screenX, e.screenY, e.clientX, e.clientY);
}
