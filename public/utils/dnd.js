'use strict';

/**
 * High level drag and drop functionality. 
 * Moves element across containers and between iframes.
 * 
 */
function Dragond(initialContainers, options) {
  const dragShadow = new DragShadow();
  const deltaPos = new DeltaPos();
  let originalSibling;
  let parent;

  const defaultOptions = {
    inserts,
  };

  options = Object.assign({}, defaultOptions, options || {});
  
  const dndOptions = Object.assign({}, options, {
    start, end, drag, over, enter, leave, drop,
  });
  
  const dnd = new Dnd(initialContainers, dndOptions);
  const dndDestroy = dnd.destroy;

  return Object.assign(dnd, {
    options,
    destroy,
  });

  function destroy() {
    deltaPos.destroy();
    dndDestroy();
  }

  function inserts() {
    return true;
  }

  function start(e, el, src) {
    // options.shadow && dragShadow.create(el, e);
    originalSibling = $(el).next()[0];
    // defer style to avoid capturing it on the drag image
    setTimeout(function() {
      $(el).addClass('dg-dragged');
      dnd.$body.addClass('dg-dragging');
    });
    options.start && options.start.call(this, e, el, src);
  }

  /**
   * Occurs when dragging has ended.
   * 
   * @param {event} e - A drag event
   * @param {element} el - The dragged element
   * @param {element} con - The receiving container (might be null)
   * @param {element} src - The source container
   * @param {element} parent - Current parent of el (can be different from con)
   * @param {element} sibling - Current sibling of el
   */
  function end(e, el, con, src) {
    // options.shadow && dragShadow.remove();
    dnd.$body.removeClass('dg-dragging');
    $(el).removeClass('dg-dragged');
    const sibling = $(el).next()[0];
    options.end && options.end.call(this, e, el, con, src, parent, sibling);
    parent = originalSibling = null;
  }

  function enter(e, el, con, src) {
    // defer style to avoid capturing it on the drag image
    setTimeout(function() {
      $(con).addClass('dg-dragover');
      if (canPlace(el, con)) {
        $(con).removeClass('dg-invalid');
      }
      else {
        $(con).addClass('dg-invalid');
        options.invalid && options.invalid.call(this, e, el, con, src);
      }
    });
    options.enter && options.enter.call(this, e, el, con, src);
  }

  function leave(e, el, con, src) {
    // console.log('leave');
    $(con).removeClass('dg-dragover dg-invalid');
    options.leave && options.leave.call(this, e, el, con, src);
  }

  function drag(e, el, con, src) {
    // options.shadow && dragShadow.drag(e);
    options.drag && options.drag.call(this, e, el, con, src);
  }

  function over(e, el, con, src) {
    if (options.inserts(el, con, src)) {
      deltaPos.update(e);
      insert(e, el, con);
    }
    options.over && options.over.call(this, e, el, con, src);
  }

  /**
   * Occurs when element is dropped to a container.
   * 
   * @param {event} e - A drag event
   * @param {element} el - The dragged element
   * @param {element} con - The receiving container
   * @param {element} src - The source container
   * @param {element} parent - Current parent of el (can be different from con)
   * @param {element} sibling - Current sibling of el
   */
  function drop(e, el, con, src) {
    const sibling = $(el).next()[0];
    options.drop && options.drop.call(this, e, el, con, src, parent, sibling);
  }

  function insert(e, el, con) {
    if (!$.contains(el, con) && canPlace(el, con)) {
      if (e.target === con) {
        if (con.childElementCount === 0) {
          con.appendChild(el);
          parent = el.parentElement;
        }
      }
      else if (deltaPos.x !== 0 || deltaPos.y !== 0) {
        insertElement(e, el, con);
      }
    }
  }

  function insertElement(e, el, con) {
    const len = 5;
    const rect = e.target.getBoundingClientRect();
    const left = rect.left + len;
    const right = rect.right - len;
    const top = rect.top + len;
    const bottom = rect.bottom - len;
    const x = e.clientX;
    const y = e.clientY;
    const beforeH = deltaPos.x < 0;
    const beforeV = deltaPos.y < 0;
    const allowBeforeH = x < left;
    const allowBeforeV = y < top;
    const allowAfterH = x > right;
    const allowAfterV = y > bottom;
    const sibling = findSibling(e.target, con);
    if ((beforeH && allowBeforeH) || (beforeV && allowBeforeV)) {
      $(el).insertBefore(sibling);
      parent = el.parentElement;
    }
    else if ((!beforeH && allowAfterH) || (!beforeV && allowAfterV)) {
      $(el).insertAfter(sibling);
      parent = el.parentElement;
    }
  }

  function findSibling(el, parent) {
    while (el.parentElement && el.parentElement !== parent) {
      el = el.parentElement;
    }
    return el;
  }

  function canPlace(el, con) {
    const tags = {
      'TABLE': ['CAPTION', 'COLGROUP', 'THEAD', 'TBODY', 'TFOOT'],
      'TBODY': ['TR'],
      'TR': ['TH', 'TD'],
    };
    if (tags[con.tagName] && !tags[con.tagName].includes(el.tagName)) {
      return false;
    }
    let found = false;
    let valid = false;
    _.forOwn(tags, function(arr, key) {
      if (arr.includes(el.tagName)) {
        if (!found) {
          found = true;
        }
        if (con.tagName === key) {
          valid = true;
          return false;
        }
      }
    });
    const result = !found || (found && valid);
    // console.log(el.tagName, con.tagName, result);
    return result;
  }

  /**
   * Calculate delta pos to decide insertion place.
   */
  function DeltaPos() {
    let posX, posY, lastX, lastY, dx, dy;
    let lastPosTimer, interval = 200;

    updateLastPos();

    return {
      update,
      destroy,
      get x() {return dx},
      get y() {return dy},
      set interval(val) {interval = val},
    };

    function destroy() {
      clearTimeout(lastPosTimer);
    }

    function update(e) {
      posX = e.clientX;
      posY = e.clientY;
      dx = posX - lastX;
      dy = posY - lastY;
    }

    // give time between update to support slow dragging
    function updateLastPos() {
      lastX = posX;
      lastY = posY;
      lastPosTimer = setTimeout(updateLastPos, interval);
    }
  }

  /**
   * Create drag shadow that can be styled with css.
   */
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
        const pos = topClientPos(e.clientX, e.clientY, e.view);
        shadowElement.style.left = `${pos.x - offsetX}px`;
        shadowElement.style.top = `${pos.y - offsetY}px`;
      }
    }

    function calcOffsets(el, e) {
      const rect = el.getBoundingClientRect();    
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    }

    // convert to the root client coordinate
    function topClientPos(x, y, win) {
      const top = win.top;
      while (win !== top) {
        if (win.frameElement) {
          const rect = win.frameElement.getBoundingClientRect();
          x += rect.left;
          y += rect.top;
        }
        win = win.parent;
      }
      return {x, y};
    }
  }

  /**
   * Core drag and drop functionaly with simple events behavior.
   * 
   * options: {
   *   copy: boolean,                     # clone element on drag
   *   accepts: function(el, con, src),   # determine if element can be dragged
   *   getElement: function(el, src),     # get the element that will be placed
   * }
   * 
   * addIframe(selector)
   * addContainers(c1, c2, ...)           
   * containers                           # can be set to a new array of containers
   */
  function Dnd(initialContainers, options) {
    let containers = initialContainers || [];
    let draggedElement, lastContainer, sourceContainer;
    let $body = $();

    const defaultOptions = {
      copy: false,
      accepts,
      getElement,
    };
    options = Object.assign({}, defaultOptions, options || {});

    initContainers();
    events(window);

    return {
      get $body() {return $body},
      addIframe,
      removeIframe,
      addContainers,
      removeFoundContainers,
      replaceBody,
      destroy,
      set containers(c) {containers = c; initContainers()},
    };

    function events(win) {
      $body = $body.add(win.document.body);
      $(win).on('dragstart', dragstart)
        .on('dragend', dragend)
        .on('drag', drag)
        .on('dragover', dragover)
        .on('dragenter', dragenter)
        .on('dragleave', dragleave)
        .on('drop', drop);
      // console.log($body.toArray());
    }

    function eventsOff(win) {
      $(win).off('dragstart dragend drag dragover dragenter dragleave drop');
    }

    function destroy() {
      $body.each(function() {
        const win = this.ownerDocument.defaultView;
        $(win).off('dragstart dragend drag dragover dragenter dragleave drop');
      });
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

    function addIframe(selector) {
      $(selector).each(function() {
        if ($(this).is('iframe')) {
          events(this.contentWindow);
        }
      });
    }

    function removeIframe(selector) {
      $(selector).each(function() {
        if ($(this).is('iframe')) {
          eventsOff(this.contentWindow);
          replaceBody(this.contentWindow.document.body);
        }
      });
    }

    function dragstart(event) {
      // console.log('dragstart');
      const e = event.originalEvent;
      findContainer(e.target, function(container) {
        draggedElement = options.getElement(e.target, container);
        lastContainer = sourceContainer = container;
        options.start && options.start.call(draggedElement, e, draggedElement, sourceContainer);
        options.enter && options.enter.call(container, e, draggedElement, container, sourceContainer);
      });
    }

    function dragend(event) {
      // console.log('dragend');
      const e = event.originalEvent;
      lastContainer && options.leave && options.leave.call(lastContainer, e, draggedElement, lastContainer, sourceContainer);
      options.end && options.end.call(draggedElement, e, draggedElement, lastContainer, sourceContainer);
      draggedElement = lastContainer = sourceContainer = null;
    }

    function dragenter(event) {
      // console.log('dragenter');
      const e = event.originalEvent;
      findContainer(e.target, function(container) {
        if (container !== lastContainer) {
          lastContainer = container;
          options.enter && options.enter.call(container, e, draggedElement, container, sourceContainer);
        }
      });
    }

    function dragleave(event) {
      // console.log('dragleave');
      const e = event.originalEvent;
      findContainer(e.target, function(container) {
        if (container !== lastContainer || !overElement(e, container)) {
          if (container === lastContainer) {
            lastContainer = null;
          }
          options.leave && options.leave.call(container, e, draggedElement, container, sourceContainer);
        }
      });
    }

    function drag(event) {
      // console.log('drag');
      const e = event.originalEvent;
      options.drag && options.drag.call(draggedElement, e, draggedElement, lastContainer, sourceContainer);
    }

    function dragover(event) {
      // console.log('dragover');
      const e = event.originalEvent;
      findContainer(e.target, function(container) {
        if (options.accepts(draggedElement, container, sourceContainer)) {
          e.preventDefault();
          options.over && options.over.call(container, e, draggedElement, container, sourceContainer);
        }
      });
    }

    function drop(event) {
      // console.log('drop');
      const e = event.originalEvent;
      findContainer(e.target, function(container) {
        options.drop && options.drop.call(container, e, draggedElement, container, sourceContainer);
      });
    }

    function initContainers() {
      containers.forEach(function(c) {
        $(c).children().prop('draggable', 'true');
      });
    }

    function addContainers() {
      _.each(arguments, function(val) {
        containers = containers.concat($(val).toArray());
      });
      containers = _.uniq(containers);
      initContainers();
      // console.log(getContainerElements());
    }

    function getContainerElements() {
      return containers.reduce(function(arr, c) {
        return arr.concat($(c).toArray());
      }, []);
    }

    function findClosestContainer(el) {
      const closestContainer = $(el).closest(getContainerElements());
      if (closestContainer.length > 0) {
        return closestContainer[0];
      }
    }

    function findContainer(el, fn) {
      const containerElement = findClosestContainer(el);
      if (containerElement) {
        fn(containerElement);
      }    
    }

    function removeFoundContainers(startEl) {
      // instanceof jQuery failed so using this instead
      if (startEl.jquery) {
        console.warn('expects a dom element, got jQuery object instead, using the first element');
        if (startEl.length <= 0) {
          throw new Error('empty array');
        }
        startEl = startEl[0];
      }
      const removes = [];
      _.each(containers, function(con) {
        if ($.contains(startEl, con)) {
          removes.push(con);
        }
      });
      containers = _.difference(containers, removes);
    }

    function overElement(e, el) {
      const x = e.clientX;
      const y = e.clientY;
      const rect = el.getBoundingClientRect();
      return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
    }

    function replaceBody(prev, el) {
      const i = $.inArray(prev, $body);
      if (i === -1) {
        return;
      }
      if (el) {
        $body.splice(i, 1, el);
      } else {
        $body.splice(i, 1);
      }
    }
  }

  Dragond.Dnd = Dnd;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Dragond: Dragond,
    Dnd: Dragond.Dnd,
  };
}