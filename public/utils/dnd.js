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

  /**
   * Unregister all events.
   */
  function destroy() {
    deltaPos.destroy();
    dndDestroy();
  }

  /**
   * Default inserts callback that always returns true.
   * 
   * @return {boolean} - True.
   */
  function inserts() {
    return true;
  }

  /**
   * Handles dragstart event.
   * 
   * @param {object} e - The drag event.
   * @param {element} el - The dragged element.
   * @param {element} src - The source container element.
   * @private
   */
  function start(e, el, src) {
    // options.shadow && dragShadow.create(el, e);
    parent = el.parentElement;
    originalSibling = $(el).next()[0];
    $(el).addClass('dg-dragged');
    dnd.$body.addClass('dg-dragging');
    options.start && options.start.call(this, e, el, src);
  }

  /**
   * Handles dragend event.
   * 
   * @param {event} e - A drag event
   * @param {element} el - The dragged element
   * @param {element} con - The receiving container (might be null)
   * @param {element} src - The source container
   * @param {element} parent - Current parent of el (can be different from con)
   * @param {element} sibling - Current sibling of el
   * @private
   */
  function end(e, el, con, src) {
    // options.shadow && dragShadow.remove();
    dnd.$body.removeClass('dg-dragging');
    $(el).removeClass('dg-dragged');
    const sibling = $(el).next()[0];
    options.end && options.end.call(this, e, el, con, src, parent, sibling);
    parent = originalSibling = null;
  }

  /**
   * Handles dragenter event.
   *
   * @param {object} e - The drag event.
   * @param {element} el - The dragged element.
   * @param {element} con - The container element being entered.
   * @param {element} src - The source container element.
   * @private
   */
  function enter(e, el, con, src) {
    $(con).addClass('dg-dragover');
    if (canPlace(el, con)) {
      $(con).removeClass('dg-invalid');
    }
    else {
      $(con).addClass('dg-invalid');
      options.invalid && options.invalid.call(this, e, el, con, src);
    }
    options.enter && options.enter.call(this, e, el, con, src);
  }

  /**
   * Handles dragleave event.
   *
   * @param {object} e - The drag event.
   * @param {element} el - The dragged element.
   * @param {element} con - The container element being leaved.
   * @param {element} src - The source container element.
   * @private
   */
  function leave(e, el, con, src) {
    $(con).removeClass('dg-dragover dg-invalid');
    options.leave && options.leave.call(this, e, el, con, src);
  }

  /**
   * Handles drag event.
   *
   * @param {object} e - The drag event.
   * @param {element} el - The dragged element.
   * @param {element} con - The container currently hovered.
   * @param {element} src - The source container element.
   * @private
   */
  function drag(e, el, con, src) {
    // options.shadow && dragShadow.drag(e);
    options.drag && options.drag.call(this, e, el, con, src);
  }

  /**
   * Handles dragover event.
   *
   * @param {object} e - The drag event.
   * @param {element} el - The dragged element.
   * @param {element} con - The container currently hovered.
   * @param {element} src - The source container element.
   * @private
   */
  function over(e, el, con, src) {
    if (options.inserts(el, con, src)) {
      deltaPos.update(e);
      insert(e, el, con);
    }
    options.over && options.over.call(this, e, el, con, src);
  }

  /**
   * Handles drop event.
   * 
   * @param {event} e - A drag event
   * @param {element} el - The dragged element
   * @param {element} con - The receiving container
   * @param {element} src - The source container
   * @private
   */
  function drop(e, el, con, src) {
    const sibling = $(el).next()[0];
    options.drop && options.drop.call(this, e, el, con, src, parent, sibling);
  }

  /**
   * Insert element into the container. Decide if it can be inserted.
   * 
   * @param {event} e - The drag event
   * @param {element} el - The dragged element
   * @param {element} con - The receiving container
   * @private
   */
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

  /**
   * Insert element into the container. Decide where to insert.
   * 
   * @param {event} e - The drag event
   * @param {element} el - The dragged element
   * @param {element} con - The receiving container
   * @private
   */
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

  /**
   * Traverse up the ancestors to find the new sibling.
   * 
   * The sibling is always the direct child of parent but might be
   * the ancestor of el or the el itself.
   * 
   * @param {element} el - The element under the cursor.
   * @param {element} parent - The parent of the sibling.
   * @return {element} - The found sibling.
   * @private
   */
  function findSibling(el, parent) {
    while (el.parentElement && el.parentElement !== parent) {
      el = el.parentElement;
    }
    return el;
  }

  /**
   * Determine if placement is valid.
   * 
   * A placement is valid if el TAG is children of con TAG, or both
   * don't exists at all on tags object.
   * 
   * @param {element} el - The dragged element.
   * @param {element} con - The receiving container.
   * @private
   */
  function canPlace(el, con) {
    const tags = {
      'TABLE': ['CAPTION', 'COLGROUP', 'THEAD', 'TBODY', 'TFOOT'],
      'TBODY': ['TR'],
      'TR': ['TH', 'TD'],
    };
    // false if parent tag matched and child tag doesn't
    if (tags[con.tagName] && !tags[con.tagName].includes(el.tagName)) {
      return false;
    }
    // check if child tag matched and parent doesn't
    let found = false;
    let valid = false;
    _.forOwn(tags, function(arr, key) {
      if (arr.includes(el.tagName)) {
        if (!found) {
          found = true;
        }
        if (con.tagName === key) {
          valid = true;
          // stop iteration
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
   * 
   * @private
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

    /**
     * Release resources.
     * 
     * @public
     */
    function destroy() {
      clearTimeout(lastPosTimer);
    }

    /**
     * Calculate delta pos.
     * 
     * @param {object} e - The drag event.
     * @public
     */
    function update(e) {
      posX = e.clientX;
      posY = e.clientY;
      dx = posX - lastX;
      dy = posY - lastY;
    }

    /**
     * Record the last position at interval.
     * 
     * Give time between update to support slow dragging

     * @private
     */
    function updateLastPos() {
      lastX = posX;
      lastY = posY;
      lastPosTimer = setTimeout(updateLastPos, interval);
    }
  }

  /**
   * Create drag shadow that can be styled with css.
   * 
   * @private
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

    /**
     * Create the drag shadow.
     * 
     * @param {element} el - The dragged element.
     * @param {object} e - The drag event.
     * @public
     */
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

    /**
     * Remove the drag shadow from the DOM.
     * 
     * @public
     */
    function remove() {
      if (shadowElement && shadowElement.parentNode) {
        shadowElement.parentNode.removeChild(shadowElement);
        shadowElement = null;
      }
    }

    /**
     * Move the drag shadow.
     * 
     * @param {object} e - The drag event.
     * @public
     */
    function drag(e) {
      if (shadowElement) {
        const pos = topClientPos(e.clientX, e.clientY, e.view);
        shadowElement.style.left = `${pos.x - offsetX}px`;
        shadowElement.style.top = `${pos.y - offsetY}px`;
      }
    }

    /**
     * Calculate the offset of clicked pos relative to the element.
     * 
     * @param {element} el - The clicked element.
     * @param {element} e - The event.
     * @private
     */
    function calcOffsets(el, e) {
      const rect = el.getBoundingClientRect();    
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    }

    /**
     * Convert coordinate to the root client coordinate.
     * 
     * @param {int} x - The x coordinate.
     * @param {int} y - The y coordinate.
     * @param {object} win - The window, might be an iframe window.
     */
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
   * @public
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
      initContainers,
      removeFoundContainers,
      replaceBody,
      destroy,
      set containers(c) {containers = c; initContainers()},
    };

    /**
     * Initialize events on the window.
     * 
     * @param {object} win - The window.
     * @private
     */
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

    /**
     * Unregister events on a window.
     * 
     * @param {object} win - The window.
     * @private
     */
    function eventsOff(win) {
      $(win).off('dragstart dragend drag dragover dragenter dragleave drop');
    }

    /**
     * Unregister all events.
     * 
     * @public
     */
    function destroy() {
      $body.each(function() {
        const win = this.ownerDocument.defaultView;
        eventsOff(win);
      });
    }

    /**
     * Default accepts callback. Always return true.
     * 
     * Determine if el can accepted by the container.
     * 
     * @return {boolean} - True.
     * @private
     */
    function accepts(el, con, src) {
      return true;
    }

    /**
     * Default getElement callback.
     * 
     * @param {element} el - The dragged element.
     * @param {element} src - The source container element.
     * @return {element} - The element that will be placed.
     * 
     * @private
     */
    function getElement(el, src) {
      if (options.copy) {
        return el.cloneNode(true);
      }
      return el;
    }

    /**
     * Add an iframe to the drag operation.
     * 
     * @param {any} selector - jQuery selector to identify the iframe.
     * 
     * @public
     */
    function addIframe(selector) {
      $(selector).each(function() {
        if ($(this).is('iframe')) {
          events(this.contentWindow);
        }
      });
    }

    /**
     * Remove an iframe from the drag operation.
     * 
     * @param {any} selector - jQuery selector to identify the iframe.
     * 
     * @public
     */
    function removeIframe(selector) {
      $(selector).each(function() {
        if ($(this).is('iframe')) {
          eventsOff(this.contentWindow);
          replaceBody(this.contentWindow.document.body);
        }
      });
    }

    /**
     * Handles the dragstart event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
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

    /**
     * Handles the dragend event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
    function dragend(event) {
      // console.log('dragend');
      const e = event.originalEvent;
      lastContainer && options.leave && options.leave.call(lastContainer, e, draggedElement, lastContainer, sourceContainer);
      options.end && options.end.call(draggedElement, e, draggedElement, lastContainer, sourceContainer);
      draggedElement = lastContainer = sourceContainer = null;
    }

    /**
     * Handles the dragenter event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
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

    /**
     * Handles the dragleave event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
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

    /**
     * Handles the drag event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
    function drag(event) {
      // console.log('drag');
      const e = event.originalEvent;
      options.drag && options.drag.call(draggedElement, e, draggedElement, lastContainer, sourceContainer);
    }

    /**
     * Handles the dragover event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
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

    /**
     * Handles the drop event.
     * 
     * @param {object} event - The drag event.
     * @private
     */
    function drop(event) {
      // console.log('drop');
      const e = event.originalEvent;
      findContainer(e.target, function(container) {
        options.drop && options.drop.call(container, e, draggedElement, container, sourceContainer);
      });
    }

    /**
     * Reinitialize the containers children.
     * 
     * Call this if there's a new container child.
     * 
     * @public
     */
    function initContainers() {
      containers.forEach(function(c) {
        $(c).children().prop('draggable', 'true');
      });
    }

    /**
     * Add containers.
     * 
     * @param {(array, ...args)} selector - Selector args or array of selectors.
     * @public
     */
    function addContainers() {
      _.each(arguments, function(val) {
        containers = containers.concat($(val).toArray());
      });
      containers = _.uniq(containers);
      initContainers();
      // console.log(getContainerElements());
    }

    /**
     * Get the elements of registered containers.
     * 
     * @return {array} - Array of container elements.
     * @private
     */
    function getContainerElements() {
      return containers.reduce(function(arr, c) {
        return arr.concat($(c).toArray());
      }, []);
    }

    /**
     * Find the closest container.
     *
     * @param {element} el - The element under the cursor. 
     * @return {element} - The container element or undefined.
     * @private
     */
    function findClosestContainer(el) {
      const closestContainer = $(el).closest(getContainerElements());
      if (closestContainer.length > 0) {
        return closestContainer[0];
      }
    }

    /**
     * Find the container of an element.
     *
     * @param {element} el - The element. 
     * @param {function} fn - Function to be called with found countainer. 
     * @private
     */
    function findContainer(el, fn) {
      const containerElement = findClosestContainer(el);
      if (containerElement) {
        fn(containerElement);
      }    
    }

    /**
     * Remove found dragond containers.
     *
     * @param {element} startEl - The element to start the search. 
     * @private
     */
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

    /**
     * Check if cursor is over the element.
     *
     * @param {object} e - The event. 
     * @param {element} el - The element. 
     * @return {boolean} - True if cursor is over the element.
     * @private
     */
    function overElement(e, el) {
      const x = e.clientX;
      const y = e.clientY;
      const rect = el.getBoundingClientRect();
      return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
    }

    /**
     * Replace the registered body with a new body.
     * 
     * @param {element} prev - The previous body element.
     * @param {element} el - The new body element or null to remove it.
     */
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

// export Dragond on module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Dragond: Dragond,
    Dnd: Dragond.Dnd,
  };
}