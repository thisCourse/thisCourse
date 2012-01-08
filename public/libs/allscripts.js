;

//     Underscore.js 1.2.1
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js** and **"CommonJS"**, with
  // backwards-compatibility for the old `require()` API. If we're not in
  // CommonJS, add `_` to the global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else if (typeof define === 'function' && define.amd) {
    // Register as a named module with AMD.
    define('underscore', function() {
      return _;
    });
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode.
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.2.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result |= iterator.call(context, value, index, list)) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, array.length - n) : array[array.length - 1];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and another.
  // Only the elements present in just the first array will remain.
  _.difference = function(array, other) {
    return _.filter(array, function(value){ return !_.include(other, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if ((a == null) || (b == null)) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (_.isFunction(a.isEqual)) return a.isEqual(b);
    if (_.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare object types.
    var typeA = typeof a;
    if (typeA != typeof b) return false;
    // Optimization; ensure that both values are truthy or falsy.
    if (!a != !b) return false;
    // `NaN` values are equal.
    if (_.isNaN(a)) return _.isNaN(b);
    // Compare string objects by value.
    var isStringA = _.isString(a), isStringB = _.isString(b);
    if (isStringA || isStringB) return isStringA && isStringB && String(a) == String(b);
    // Compare number objects by value.
    var isNumberA = _.isNumber(a), isNumberB = _.isNumber(b);
    if (isNumberA || isNumberB) return isNumberA && isNumberB && +a == +b;
    // Compare boolean objects by value. The value of `true` is 1; the value of `false` is 0.
    var isBooleanA = _.isBoolean(a), isBooleanB = _.isBoolean(b);
    if (isBooleanA || isBooleanB) return isBooleanA && isBooleanB && +a == +b;
    // Compare dates by their millisecond values.
    var isDateA = _.isDate(a), isDateB = _.isDate(b);
    if (isDateA || isDateB) return isDateA && isDateB && a.getTime() == b.getTime();
    // Compare RegExps by their source patterns and flags.
    var isRegExpA = _.isRegExp(a), isRegExpB = _.isRegExp(b);
    if (isRegExpA || isRegExpB) {
      // Ensure commutative equality for RegExps.
      return isRegExpA && isRegExpB &&
             a.source == b.source &&
             a.global == b.global &&
             a.multiline == b.multiline &&
             a.ignoreCase == b.ignoreCase;
    }
    // Ensure that both values are objects.
    if (typeA != 'object') return false;
    // Arrays or Arraylikes with different lengths are not equal.
    if (a.length !== b.length) return false;
    // Objects with different constructors are not equal.
    if (a.constructor !== b.constructor) return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Deep compare objects.
    for (var key in a) {
      if (hasOwnProperty.call(a, key)) {
        // Count the expected number of properties.
        size++;
        // Deep compare each member.
        if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], stack))) break;
      }
    }
    // Ensure that both objects contain the same number of properties.
    if (result) {
      for (key in b) {
        if (hasOwnProperty.call(b, key) && !(size--)) break;
      }
      result = !size;
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  if (toString.call(arguments) == '[object Arguments]') {
    _.isArguments = function(obj) {
      return toString.call(obj) == '[object Arguments]';
    };
  } else {
    _.isArguments = function(obj) {
      return !!(obj && hasOwnProperty.call(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape, function(match, code) {
           return "',_.escape(" + code.replace(/\\'/g, "'") + "),'";
         })
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    return data ? func(data, _) : function(data) { return func(data, _) };
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
;

//     Backbone.js 0.5.3
//     (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://documentcloud.github.com/backbone

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object.
  var root = this;

  // Save the previous value of the `Backbone` variable.
  var previousBackbone = root.Backbone;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.5.3';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option will
  // fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
  // `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may `bind` or `unbind` a callback function to an event;
  // `trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.bind('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Backbone.Events = {

    // Bind an event, specified by a string name, `ev`, to a `callback` function.
    // Passing `"all"` will bind the callback to all events fired.
    bind : function(ev, callback, context) {
      var calls = this._callbacks || (this._callbacks = {});
      var list  = calls[ev] || (calls[ev] = []);
      list.push([callback, context]);
      return this;
    },

    // Remove one or many callbacks. If `callback` is null, removes all
    // callbacks for the event. If `ev` is null, removes all bound callbacks
    // for all events.
    unbind : function(ev, callback) {
      var calls;
      if (!ev) {
        this._callbacks = {};
      } else if (calls = this._callbacks) {
        if (!callback) {
          calls[ev] = [];
        } else {
          var list = calls[ev];
          if (!list) return this;
          for (var i = 0, l = list.length; i < l; i++) {
            if (list[i] && callback === list[i][0]) {
              list[i] = null;
              break;
            }
          }
        }
      }
      return this;
    },

    // Trigger an event, firing all bound callbacks. Callbacks are passed the
    // same arguments as `trigger` is, apart from the event name.
    // Listening for `"all"` passes the true event name as the first argument.
    trigger : function(eventName) {
      var list, calls, ev, callback, args;
      var both = 2;
      if (!(calls = this._callbacks)) return this;
      while (both--) {
        ev = both ? eventName : 'all';
        if (list = calls[ev]) {
          for (var i = 0, l = list.length; i < l; i++) {
            if (!(callback = list[i])) {
              list.splice(i, 1); i--; l--;
            } else {
              args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
              callback[0].apply(callback[1] || this, args);
            }
          }
        }
      }
      return this;
    }

  };

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (defaults = this.defaults) {
      if (_.isFunction(defaults)) defaults = defaults.call(this);
      attributes = _.extend({}, defaults, attributes);
    }
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.set(attributes, {silent : true});
    this._changed = false;
    this._previousAttributes = _.clone(this.attributes);
    if (options && options.collection) this.collection = options.collection;
    this.initialize(attributes, options);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Backbone.Model.prototype, Backbone.Events, {

    // A snapshot of the model's previous attributes, taken immediately
    // after the last `"change"` event was fired.
    _previousAttributes : null,

    // Has the item been changed since the last `"change"` event?
    _changed : false,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute : 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Return a copy of the model's `attributes` object.
    toJSON : function() {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get : function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape : function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.attributes[attr];
      return this._escapedAttributes[attr] = escapeHTML(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has : function(attr) {
      return this.attributes[attr] != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless you
    // choose to silence it.
    set : function(attrs, options) {

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs.attributes) attrs = attrs.attributes;
      var now = this.attributes, escaped = this._escapedAttributes;

      // Run validation.
      if (!options.silent && this.validate && !this._performValidation(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // We're about to start triggering change events.
      var alreadyChanging = this._changing;
      this._changing = true;

      // Update attributes.
      for (var attr in attrs) {
        var val = attrs[attr];
        if (!_.isEqual(now[attr], val)) {
          now[attr] = val;
          delete escaped[attr];
          this._changed = true;
          if (!options.silent) this.trigger('change:' + attr, this, val, options);
        }
      }

      // Fire the `"change"` event, if the model has been changed.
      if (!alreadyChanging && !options.silent && this._changed) this.change(options);
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset : function(attr, options) {
      if (!(attr in this.attributes)) return this;
      options || (options = {});
      var value = this.attributes[attr];

      // Run validation.
      var validObj = {};
      validObj[attr] = void 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      // Remove the attribute.
      delete this.attributes[attr];
      delete this._escapedAttributes[attr];
      if (attr == this.idAttribute) delete this.id;
      this._changed = true;
      if (!options.silent) {
        this.trigger('change:' + attr, this, void 0, options);
        this.change(options);
      }
      return this;
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear : function(options) {
      options || (options = {});
      var attr;
      var old = this.attributes;

      // Run validation.
      var validObj = {};
      for (attr in old) validObj[attr] = void 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      this.attributes = {};
      this._escapedAttributes = {};
      this._changed = true;
      if (!options.silent) {
        for (attr in old) {
          this.trigger('change:' + attr, this, void 0, options);
        }
        this.change(options);
      }
      return this;
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch : function(options) {
      options || (options = {});
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save : function(attrs, options) {
      options || (options = {});
      if (attrs && !this.set(attrs, options)) return false;
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp, xhr);
      };
      options.error = wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      return (this.sync || Backbone.sync).call(this, method, this, options);
    },

    // Destroy this model on the server if it was already persisted. Upon success, the model is removed
    // from its collection, if it has one.
    destroy : function(options) {
      options || (options = {});
      if (this.isNew()) return this.trigger('destroy', this, this.collection, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        model.trigger('destroy', model, model.collection, options);
        if (success) success(model, resp);
      };
      options.error = wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'delete', this, options);
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url : function() {
      var base = getUrl(this.collection) || this.urlRoot || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse : function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone : function() {
      return new this.constructor(this);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew : function() {
      return this.id == null;
    },

    // Call this method to manually fire a `change` event for this model.
    // Calling this will cause all objects observing the model to update.
    change : function(options) {
      this.trigger('change', this, options);
      this._previousAttributes = _.clone(this.attributes);
      this._changed = false;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged : function(attr) {
      if (attr) return this._previousAttributes[attr] != this.attributes[attr];
      return this._changed;
    },

    // Return an object containing all the attributes that have changed, or false
    // if there are no changed attributes. Useful for determining what parts of a
    // view need to be updated and/or what attributes need to be persisted to
    // the server.
    changedAttributes : function(now) {
      now || (now = this.attributes);
      var old = this._previousAttributes;
      var changed = false;
      for (var attr in now) {
        if (!_.isEqual(old[attr], now[attr])) {
          changed = changed || {};
          changed[attr] = now[attr];
        }
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous : function(attr) {
      if (!attr || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes : function() {
      return _.clone(this._previousAttributes);
    },

    // Run validation against a set of incoming attributes, returning `true`
    // if all is well. If a specific `error` callback has been passed,
    // call that instead of firing the general `"error"` event.
    _performValidation : function(attrs, options) {
      var error = this.validate(attrs);
      if (error) {
        if (options.error) {
          options.error(this, error, options);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      }
      return true;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.comparator) this.comparator = options.comparator;
    _.bindAll(this, '_onModelEvent', '_removeReference');
    this._reset();
    if (models) this.reset(models, {silent: true});
    this.initialize.apply(this, arguments);
  };

  // Define the Collection's inheritable methods.
  _.extend(Backbone.Collection.prototype, Backbone.Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model : Backbone.Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON : function() {
      return this.map(function(model){ return model.toJSON(); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `added` event for every new model.
    add : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._add(models[i], options);
        }
      } else {
        this._add(models, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `removed` event for every model removed.
    remove : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._remove(models[i], options);
        }
      } else {
        this._remove(models, options);
      }
      return this;
    },

    // Get a model from the set by id.
    get : function(id) {
      if (id == null) return null;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid : function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Force the collection to re-sort itself. You don't need to call this under normal
    // circumstances, as the set will maintain sort order as each item is added.
    sort : function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      this.models = this.sortBy(this.comparator);
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck : function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `added` or `removed` events. Fires `reset` when finished.
    reset : function(models, options) {
      models  || (models = []);
      options || (options = {});
      this.each(this._removeReference);
      this._reset();
      this.add(models, {silent: true});
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch : function(options) {
      options || (options = {});
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. After the model
    // has been created on the server, it will be added to the collection.
    // Returns the model, or 'false' if validation on a new model fails.
    create : function(model, options) {
      var coll = this;
      options || (options = {});
      model = this._prepareModel(model, options);
      if (!model) return false;
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        coll.add(nextModel, options);
        if (success) success(nextModel, resp, xhr);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse : function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset : function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model to be added to this collection
    _prepareModel: function(model, options) {
      if (!(model instanceof Backbone.Model)) {
        var attrs = model;
        model = new this.model(attrs, {collection: this});
        if (model.validate && !model._performValidation(attrs, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal implementation of adding a single model to the set, updating
    // hash indexes for `id` and `cid` lookups.
    // Returns the model, or 'false' if validation on a new model fails.
    _add : function(model, options) {
      options || (options = {});
      model = this._prepareModel(model, options);
      if (!model) return false;
      var already = this.getByCid(model);
      if (already) throw new Error(["Can't add the same model to a set twice", already.id]);
      this._byId[model.id] = model;
      this._byCid[model.cid] = model;
      var index = options.at != null ? options.at :
                  this.comparator ? this.sortedIndex(model, this.comparator) :
                  this.length;
      this.models.splice(index, 0, model);
      model.bind('all', this._onModelEvent);
      this.length++;
      if (!options.silent) model.trigger('add', model, this, options);
      return model;
    },

    // Internal implementation of removing a single model from the set, updating
    // hash indexes for `id` and `cid` lookups.
    _remove : function(model, options) {
      options || (options = {});
      model = this.getByCid(model) || this.get(model);
      if (!model) return null;
      delete this._byId[model.id];
      delete this._byCid[model.cid];
      this.models.splice(this.indexOf(model), 1);
      this.length--;
      if (!options.silent) model.trigger('remove', model, this, options);
      this._removeReference(model);
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference : function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.unbind('all', this._onModelEvent);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent : function(ev, model, collection, options) {
      if ((ev == 'add' || ev == 'remove') && collection != this) return;
      if (ev == 'destroy') {
        this._remove(model, options);
      }
      if (model && ev === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
    'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Backbone.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:([\w\d]+)/g;
  var splatParam    = /\*([\w\d]+)/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Backbone.Router.prototype, Backbone.Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route : function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
      }, this));
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate : function(fragment, triggerRoute) {
      Backbone.history.navigate(fragment, triggerRoute);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes : function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp : function(route) {
      route = route.replace(escapeRegExp, "\\$&")
                   .replace(namedParam, "([^\/]*)")
                   .replace(splatParam, "(.*?)");
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters : function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning hashes.
  var hashStrip = /^#*/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  var historyStarted = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(Backbone.History.prototype, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment : function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = window.location.hash;
        }
      }
      fragment = decodeURIComponent(fragment.replace(hashStrip, ''));
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment;
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start : function(options) {

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      if (historyStarted) throw new Error("Backbone.history has already been started");
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if ('onhashchange' in window && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else {
        setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      historyStarted = true;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;
      if (this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = loc.hash.replace(hashStrip, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Add a route to be tested when the fragment changes. Routes added later may
    // override previous routes.
    route : function(route, callback) {
      this.handlers.unshift({route : route, callback : callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl : function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.iframe.location.hash);
      if (current == this.fragment || current == decodeURIComponent(this.fragment)) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(window.location.hash);
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl : function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history. You are responsible for properly
    // URL-encoding the fragment in advance. This does not trigger
    // a `hashchange` event.
    navigate : function(fragment, triggerRoute) {
      var frag = (fragment || '').replace(hashStrip, '');
      if (this.fragment == frag || this.fragment == decodeURIComponent(frag)) return;
      if (this._hasPushState) {
        var loc = window.location;
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history.pushState({}, document.title, loc.protocol + '//' + loc.host + frag);
      } else {
        window.location.hash = this.fragment = frag;
        if (this.iframe && (frag != this.getFragment(this.iframe.location.hash))) {
          this.iframe.document.open().close();
          this.iframe.location.hash = frag;
        }
      }
      if (triggerRoute) this.loadUrl(fragment);
    }

  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.delegateEvents();
    this.initialize.apply(this, arguments);
  };

  // Element lookup, scoped to DOM elements within the current view.
  // This should be prefered to global lookups, if you're dealing with
  // a specific view.
  var selectorDelegate = function(selector) {
    return $(selector, this.el);
  };

  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(Backbone.View.prototype, Backbone.Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName : 'div',

    // Attach the `selectorDelegate` function as the `$` property.
    $       : selectorDelegate,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render : function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove : function() {
      $(this.el).remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make : function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents : function(events) {
      if (!(events || (events = this.events))) return;
      if (_.isFunction(events)) events = events.call(this);
      this.undelegateEvents();
      for (var key in events) {
        var method = this[events[key]];
        if (!method) throw new Error('Event "' + events[key] + '" does not exist');
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          $(this.el).bind(eventName, method);
        } else {
          $(this.el).delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    undelegateEvents: function() {
      $(this.el).unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure : function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement : function() {
      if (!this.el) {
        var attrs = this.attributes || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.el = this.make(this.tagName, attrs);
      } else if (_.isString(this.el)) {
        this.el = $(this.el).get(0);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Backbone.Model.extend = Backbone.Collection.extend =
    Backbone.Router.extend = Backbone.View.extend = extend;

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded` instead of
  // `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default JSON-request options.
    var params = _.extend({
      type:         type,
      dataType:     'json'
    }, options);

    // Ensure that we have a URL.
    if (!params.url) {
      params.url = getUrl(model) || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!params.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data        = params.data ? {model : params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request.
    return $.ajax(params);
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a URL from a Model or Collection as a property
  // or as a function.
  var getUrl = function(object) {
    if (!(object && object.url)) return null;
    return _.isFunction(object.url) ? object.url() : object.url;
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(onError, model, options) {
    return function(resp) {
      if (onError) {
        onError(model, resp, options);
      } else {
        model.trigger('error', model, resp, options);
      }
    };
  };

  // Helper function to escape a string for HTML rendering.
  var escapeHTML = function(string) {
    return string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

}).call(this);
;

/**	
 * Backbone-relational.js 0.4.0
 * (c) 2011 Paul Uithol
 * 
 * Backbone-relational may be freely distributed under the MIT license.
 * For details and documentation: https://github.com/PaulUithol/Backbone-relational.
 * Depends on (as in, compeletely useless without) Backbone: https://github.com/documentcloud/backbone.
 */
(function(undefined) {

	/**
	 * CommonJS shim
	 **/
	if ( typeof window === 'undefined' ) {
		var _ = require( 'underscore' );
		var Backbone = require( 'backbone' );
		var exports = module.exports = Backbone;
	} else {
		var _ = this._;
		var Backbone = this.Backbone;
		var exports = this;
	}
	
	Backbone.Relational = {};
	
	/**
	 * Semaphore mixin; can be used as both binary and counting.
	 **/
	Backbone.Semaphore = {
		_permitsAvailable: null,
		_permitsUsed: 0,
		
		acquire: function() {
			if ( this._permitsAvailable && this._permitsUsed >= this._permitsAvailable ) {
				throw new Error( 'Max permits acquired' );
			}
			else {
				this._permitsUsed++;
			}
		},
		
		release: function() {
			if ( this._permitsUsed === 0 ) {
				throw new Error( 'All permits released' );
			}
			else {
				this._permitsUsed--;
			}
		},
		
		isLocked: function() {
			return this._permitsUsed > 0;
		},
		
		setAvailablePermits: function( amount ) {
			if ( this._permitsUsed > amount ) {
				throw new Error( 'Available permits cannot be less than used permits' );
			}
			this._permitsAvailable = amount;
		}
	};
	
	/**
	 * A BlockingQueue that accumulates items while blocked (via 'block'),
	 * and processes them when unblocked (via 'unblock').
	 * Process can also be called manually (via 'process').
	 */
	Backbone.BlockingQueue = function() {
		this._queue = [];
	};
	_.extend( Backbone.BlockingQueue.prototype, Backbone.Semaphore, {
		_queue: null,
		
		add: function( func ) {
			if ( this.isBlocked() ) {
				this._queue.push( func );
			}
			else {
				func();
			}
		},
		
		process: function() {
			while ( this._queue && this._queue.length ) {
				this._queue.shift()();
			}
		},
		
		block: function() {
			this.acquire();
		},
		
		unblock: function() {
			this.release();
			if ( !this.isBlocked() ) {
				this.process();
			}
		},
		
		isBlocked: function() {
			return this.isLocked();
		}
	});
	/**
	 * Global event queue. Accumulates external events ('add:<key>', 'remove:<key>' and 'update:<key>')
	 * until the top-level object is fully initialized (see 'Backbone.RelationalModel').
	 */
	Backbone.Relational.eventQueue = new Backbone.BlockingQueue();
	
	/**
	 * Backbone.Store keeps track of all created (and destruction of) Backbone.RelationalModel.
	 * Handles lookup for relations.
	 */
	Backbone.Store =  function() {
		this._collections = [];
		this._reverseRelations = [];
	};
	_.extend( Backbone.Store.prototype, Backbone.Events, {
		_collections: null,
		_reverseRelations: null,
		
		/**
		 * Add a reverse relation. Is added to the 'relations' property on model's prototype, and to
		 * existing instances of 'model' in the store as well.
		 * @param {object} relation; required properties:
		 *  - model, type, key and relatedModel
		 */
		addReverseRelation: function( relation ) {
			var exists = _.any( this._reverseRelations, function( rel ) {
				return _.all( relation, function( val, key ) {
					return val === rel[ key ];
				});
			});
			
			if ( !exists && relation.model && relation.type ) {
				this._reverseRelations.push( relation );
				
				if ( !relation.model.prototype.relations ) {
					relation.model.prototype.relations = [];
				}
				relation.model.prototype.relations.push( relation );
				
				this.retroFitRelation( relation );
			}
		},
		
		/**
		 * Add a 'relation' to all existing instances of 'relation.model' in the store
		 */
		retroFitRelation: function( relation ) {
			var coll = this.getCollection( relation.model );
			coll.each( function( model ) {
				var rel = new relation.type( model, relation );
			}, this);
		},
		
		/**
		 * Find the Store's collection for a certain type of model.
		 * @param model {Backbone.RelationalModel}
		 * @return {Backbone.Collection} A collection if found (or applicable for 'model'), or null
		 */
		getCollection: function( model ) {
			var coll =  _.detect( this._collections, function( c ) {
					// Check if model is the type itself (a ref to the constructor), or is of type c.model
					return model === c.model || model.constructor === c.model;
				});
			
			if ( !coll ) {
				coll = this._createCollection( model );
			}
			
			return coll;
		},
		
		/**
		 * Find a type on the global object by name. Splits name on dots.
		 * @param {string} name
		 */
		getObjectByName: function( name ) {
			var type = _.reduce( name.split( '.' ), function( memo, val ) {
				return memo[ val ];
			}, exports);
			return type !== exports ? type: null;
		},
		
		_createCollection: function( type ) {
			var coll;
			
			// If 'type' is an instance, take it's constructor
			if ( type instanceof Backbone.RelationalModel ) {
				type = type.constructor;
			}
			
			// Type should inherit from Backbone.RelationalModel.
			if ( type.prototype instanceof Backbone.RelationalModel.prototype.constructor ) {
				coll = new Backbone.Collection();
				coll.model = type;
				
				this._collections.push( coll );
			}
			
			return coll;
		},
		
		find: function( type, id ) {
			var coll = this.getCollection( type );
			return coll && coll.get( id );
		},
		
		/**
		 * Add a 'model' to it's appropriate collection. Retain the original contents of 'model.collection'.
		 */
		register: function( model ) {
			var modelColl = model.collection;
			var coll = this.getCollection( model );
			coll && coll._add( model );
			model.bind( 'destroy', this.unregister, this );
			model.collection = modelColl;
		},
		
		/**
		 * Explicitly update a model's id in it's store collection
		 */
		update: function( model ) {
			var coll = this.getCollection( model );
			coll._onModelEvent( 'change:' + model.idAttribute, model, coll );
		},
		
		/**
		 * Remove a 'model' from the store.
		 */
		unregister: function( model ) {
			model.unbind( 'destroy', this.unregister );
			var coll = this.getCollection( model );
			coll && coll.remove( model );
		}
	});
	Backbone.Relational.store = new Backbone.Store();
	
	/**
	 * The main Relation class, from which 'HasOne' and 'HasMany' inherit.
	 * @param {Backbone.RelationalModel} instance
	 * @param {object} options.
	 *  Required properties:
	 *    - {string} key
	 *    - {Backbone.RelationalModel.constructor} relatedModel
	 *  Optional properties:
	 *    - {bool} includeInJSON: create objects from the contents of keys if the object is not found in Backbone.store.
	 *    - {bool} createModels: serialize the attributes for related model(s)' in toJSON on create/update, or just their ids.
	 *    - {object} reverseRelation: Specify a bi-directional relation. If provided, Relation will reciprocate
	 *        the relation to the 'relatedModel'. Required and optional properties match 'options', except for:
	 *        - {Backbone.Relation|string} type: 'HasOne' or 'HasMany'
	 */
	Backbone.Relation = function( instance, options ) {
		this.instance = instance;
		
		// Make sure 'options' is sane, and fill with defaults from subclasses and this object's prototype
		options = ( typeof options === 'object' && options ) || {};
		this.reverseRelation = _.defaults( options.reverseRelation || {}, this.options.reverseRelation );
		this.reverseRelation.type = !_.isString( this.reverseRelation.type ) ? this.reverseRelation.type :
				Backbone[ this.reverseRelation.type ] || Backbone.Relational.store.getObjectByName( this.reverseRelation.type );
		this.options = _.defaults( options, this.options, Backbone.Relation.prototype.options );
		
		this.key = this.options.key;
		this.keyContents = this.instance.get( this.key );
		
		// 'exports' should be the global object where 'relatedModel' can be found on if given as a string.
		this.relatedModel = this.options.relatedModel;
		if ( _.isString( this.relatedModel ) ) {
			this.relatedModel = Backbone.Relational.store.getObjectByName( this.relatedModel );
		}
		
		if ( !this.checkPreconditions() ) {
			return false;
		}
		
		// Add this Relation to instance._relations
		this.instance._relations.push( this );
		
		// Add the reverse relation on 'relatedModel' to the store's reverseRelations
		if ( !this.options.isAutoRelation && this.reverseRelation.type && this.reverseRelation.key ) {
			Backbone.Relational.store.addReverseRelation( _.defaults( {
					isAutoRelation: true,
					model: this.relatedModel,
					relatedModel: this.instance.constructor,
					reverseRelation: this.options // current relation is the 'reverseRelation' for it's own reverseRelation
				},
				this.reverseRelation // Take further properties from this.reverseRelation (type, key, etc.)
			) );
		}
		
		this.initialize();
		
		_.bindAll( this, '_modelRemovedFromCollection', '_relatedModelAdded', '_relatedModelRemoved' );
		// When a model in the store is destroyed, check if it is 'this.instance'.
		Backbone.Relational.store.getCollection( this.instance )
			.bind( 'relational:remove', this._modelRemovedFromCollection );
		
		// When 'relatedModel' are created or destroyed, check if it affects this relation.
		Backbone.Relational.store.getCollection( this.relatedModel )
			.bind( 'relational:add', this._relatedModelAdded )
			.bind( 'relational:remove', this._relatedModelRemoved );
	};
	// Fix inheritance :\
	Backbone.Relation.extend = Backbone.Model.extend;
	// Set up all inheritable **Backbone.Relation** properties and methods.
	_.extend( Backbone.Relation.prototype, Backbone.Events, Backbone.Semaphore, {
		options: {
			createModels: true,
			includeInJSON: true,
			isAutoRelation: false
		},
		
		instance: null,
		key: null,
		keyContents: null,
		relatedModel: null,
		reverseRelation: null,
		related: null,
		
		_relatedModelAdded: function( model, coll, options ) {
			// Allow 'model' to set up it's relations, before calling 'tryAddRelated'
			// (which can result in a call to 'addRelated' on a relation of 'model')
			var dit = this;
			model.queue( function() {
				dit.tryAddRelated( model, options );
			});
		},
		
		_relatedModelRemoved: function( model, coll, options ) {
			this.removeRelated( model, options );
		},
		
		_modelRemovedFromCollection: function( model ) {
			if ( model === this.instance ) {
				this.destroy();
			}
		},
		
		/**
		 * Check several pre-conditions.
		 * @return {bool} True if pre-conditions are satisfied, false if they're not.
		 */
		checkPreconditions: function() {
			var i = this.instance, k = this.key, rm = this.relatedModel;
			if ( !i || !k || !rm ) {
				console && console.warn( 'Relation=%o; no instance, key or relatedModel (%o, %o, %o)', this, i, k, rm );
				return false;
			}
			// Check if 'instance' is a Backbone.RelationalModel
			if ( !( i instanceof Backbone.RelationalModel ) ) {
				console && console.warn( 'Relation=%o; instance=%o is not a Backbone.RelationalModel', this, i );
				return false;
			}
			// Check if the type in 'relatedModel' inherits from Backbone.RelationalModel
			if ( !( rm.prototype instanceof Backbone.RelationalModel.prototype.constructor ) ) {
				console && console.warn( 'Relation=%o; relatedModel does not inherit from Backbone.RelationalModel (%o)', this, rm );
				return false;
			}
			// Check if this is not a HasMany, and the reverse relation is HasMany as well
			if ( this instanceof Backbone.HasMany && this.reverseRelation.type === Backbone.HasMany.prototype.constructor ) {
				console && console.warn( 'Relation=%o; relation is a HasMany, and the reverseRelation is HasMany as well.', this );
				return false;
			}
			// Check if we're not attempting to create a duplicate relationship
			if ( i._relations.length ) {
				var exists = _.any( i._relations, function( rel ) {
					var hasReverseRelation = this.reverseRelation.key && rel.reverseRelation.key;
					return rel.relatedModel === rm && rel.key === k
						&& ( !hasReverseRelation || this.reverseRelation.key === rel.reverseRelation.key );
				}, this );
				
				if ( exists ) {
					console && console.warn( 'Relation=%o between instance=%o.%s and relatedModel=%o.%s already exists',
						this, i, k, rm, this.reverseRelation.key );
					return false;
				}
			}
			return true;
		},
		
		setRelated: function( related, options ) {
			this.related = related;
			var value = {};
			value[ this.key ] = related;
			this.instance.acquire();
			this.instance.set( value, _.defaults( options || {}, { silent: true } ) );
			this.instance.release();
		},
		
		createModel: function( item ) {
			if ( this.options.createModels && typeof( item ) === 'object' ) {
				return new this.relatedModel( item );
			}
		},
		
		/**
		 * Determine if a relation (on a different RelationalModel) is the reverse
		 * relation of the current one.
		 */
		_isReverseRelation: function( relation ) {
			if ( relation.instance instanceof this.relatedModel && this.reverseRelation.key === relation.key
					&&	this.key === relation.reverseRelation.key ) {
				return true;
			}
			return false;
		},
		
		/**
		 * Get the reverse relations (pointing back to 'this.key' on 'this.instance') for the currently related model(s).
		 * @param model {Backbone.RelationalModel} Optional; get the reverse relations for a specific model.
		 *		If not specified, 'this.related' is used.
		 */
		getReverseRelations: function( model ) {
			var reverseRelations = [];
			// Iterate over 'model', 'this.related.models' (if this.related is a Backbone.Collection), or wrap 'this.related' in an array.
			var models = !_.isUndefined( model ) ? [ model ] : this.related && ( this.related.models || [ this.related ] );
			_.each( models , function( related ) {
				_.each( related.getRelations(), function( relation ) {
					if ( this._isReverseRelation( relation ) ) {
						reverseRelations.push( relation );
					}
				}, this );
			}, this );
			
			return reverseRelations;
		},
		
		/**
		 * Rename options.silent, so add/remove events propagate properly.
		 * (for example in HasMany, from 'addRelated'->'handleAddition')
		 */
		sanitizeOptions: function( options ) {
			options || ( options = {} );
			if ( options.silent ) {
				options = _.extend( {}, options, { silentChange: true } );
				delete options.silent;
			}
			return options;
		},
		
		// Cleanup. Get reverse relation, call removeRelated on each.
		destroy: function() {
			Backbone.Relational.store.getCollection( this.instance )
				.unbind( 'relational:remove', this._modelRemovedFromCollection );
			
			Backbone.Relational.store.getCollection( this.relatedModel )
				.unbind( 'relational:add', this._relatedModelAdded )
				.unbind( 'relational:remove', this._relatedModelRemoved );
			
			_.each( this.getReverseRelations(), function( relation ) {
					relation.removeRelated( this.instance );
				}, this );
		}
	});
	
	Backbone.HasOne = Backbone.Relation.extend({
		options: {
			reverseRelation: { type: 'HasMany' }
		},
		
		initialize: function() {
			_.bindAll( this, 'onChange' );
			this.instance.bind( 'relational:change:' + this.key, this.onChange );
			
			var model = this.findRelated( { silent: true } );
			this.setRelated( model );
			
			// Notify new 'related' object of the new relation.
			var dit = this;
			_.each( dit.getReverseRelations(), function( relation ) {
					relation.addRelated( dit.instance );
				} );
		},
		
		findRelated: function( options ) {
			var item = this.keyContents;
			var model = null;
			
			if ( item instanceof this.relatedModel ) {
				model = item;
			}
			else if ( item && ( _.isString( item ) || _.isNumber( item ) || typeof( item ) === 'object' ) ) {
				// Try to find an instance of the appropriate 'relatedModel' in the store, or create it
				var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
				model = Backbone.Relational.store.find( this.relatedModel, id );
				if ( model && _.isObject( item ) ) {
					model.set( item, options );
				}
				else if ( !model ) {
					model = this.createModel( item );
				}
			}
			
			return model;
		},
		
		/**
		 * If the key is changed, notify old & new reverse relations and initialize the new relation
		 */
		onChange: function( model, attr, options ) {
			// Don't accept recursive calls to onChange (like onChange->findRelated->createModel->initializeRelations->addRelated->onChange)
			if ( this.isLocked() ) {
				return;
			}
			this.acquire();
			options = this.sanitizeOptions( options );
			
			// 'options._related' is set by 'addRelated'/'removeRelated'. If it is set, the change
			// is the result of a call from a relation. If it's not, the change is the result of 
			// a 'set' call on this.instance.
			var changed = _.isUndefined( options._related );
			var oldRelated = changed ? this.related : options._related;
			
			if ( changed ) {	
				this.keyContents = attr;
				
				// Set new 'related'
				if ( attr instanceof this.relatedModel ) {
					this.related = attr;
				}
				else if ( attr ) {
					var related = this.findRelated( options );
					this.setRelated( related );
				}
				else {
					this.setRelated( null );
				}
			}
			
			// Notify old 'related' object of the terminated relation
			if ( oldRelated && this.related !== oldRelated ) {
				_.each( this.getReverseRelations( oldRelated ), function( relation ) {
						relation.removeRelated( this.instance, options );
					}, this );
			}
			
			// Notify new 'related' object of the new relation. Note we do re-apply even if this.related is oldRelated;
			// that can be necessary for bi-directional relations if 'this.instance' was created after 'this.related'.
			// In that case, 'this.instance' will already know 'this.related', but the reverse might not exist yet.
			_.each( this.getReverseRelations(), function( relation ) {
					relation.addRelated( this.instance, options );
				}, this);
			
			// Fire the 'update:<key>' event if 'related' was updated
			if ( !options.silentChange && this.related !== oldRelated ) {
				var dit = this;
				Backbone.Relational.eventQueue.add( function() {
					dit.instance.trigger( 'update:' + dit.key, dit.instance, dit.related, options );
				});
			}
			this.release();
		},
		
		/**
		 * If a new 'this.relatedModel' appears in the 'store', try to match it to the last set 'keyContents'
		 */
		tryAddRelated: function( model, options ) {
			if ( this.related ) {
				return;
			}
			options = this.sanitizeOptions( options );
			
			var item = this.keyContents;
			if ( item && ( _.isString( item ) || _.isNumber( item ) || typeof( item ) === 'object' ) ) {
				var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
				if ( model.id === id ) {
					this.addRelated( model, options );
				}
			}
		},
		
		addRelated: function( model, options ) {
			if ( model !== this.related ) {
				var oldRelated = this.related || null;
				this.setRelated( model );
				this.onChange( this.instance, model, { _related: oldRelated } );
			}
		},
		
		removeRelated: function( model, options ) {
			if ( !this.related ) {
				return;
			}
			
			if ( model === this.related ) {
				var oldRelated = this.related || null;
				this.setRelated( null );
				this.onChange( this.instance, model, { _related: oldRelated } );
			}
		}
	});
	
	Backbone.HasMany = Backbone.Relation.extend({
		collectionType: null,
		
		options: {
			reverseRelation: { type: 'HasOne' },
			collectionType: Backbone.Collection
		},
		
		initialize: function() {
			_.bindAll( this, 'onChange', 'handleAddition', 'handleRemoval' );
			this.instance.bind( 'relational:change:' + this.key, this.onChange );
			
			// Handle a custom 'collectionType'
			this.collectionType = this.options.collectionType;
			if ( _( this.collectionType ).isString() ) {
				this.collectionType = Backbone.Relational.store.getObjectByName( this.collectionType );
			}
			if ( !this.collectionType.prototype instanceof Backbone.Collection.prototype.constructor ){
				throw new Error( 'collectionType must inherit from Backbone.Collection' );
			}
			
			this.setRelated( this.prepareCollection( new this.collectionType() ) );
			this.findRelated( { silent: true } );
		},
		
		prepareCollection: function( collection ) {
			if ( this.related ) {
				this.related.unbind( 'relational:add', this.handleAddition ).unbind('relational:remove', this.handleRemoval );
			}
			
			collection.reset();
			collection.model = this.relatedModel;
			collection.bind( 'relational:add', this.handleAddition ).bind('relational:remove', this.handleRemoval );
			return collection;
		},
		
		findRelated: function( options ) {
			if ( this.keyContents && _.isArray( this.keyContents ) ) {
				// Try to find instances of the appropriate 'relatedModel' in the store
				_.each( this.keyContents, function( item ) {
					var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
					
					var model = Backbone.Relational.store.find( this.relatedModel, id );
					if ( model && _.isObject( item ) ) {
						model.set( item, options );
					}
					else if ( !model ) {
						model = this.createModel( item );
					}
					
					if ( model && !this.related.getByCid( model ) && !this.related.get( model ) ) {
						this.related._add( model );
					}
				}, this);
			}
		},
		
		/**
		 * If the key is changed, notify old & new reverse relations and initialize the new relation
		 */
		onChange: function( model, attr, options ) {
			options = this.sanitizeOptions( options );
			this.keyContents = attr;
			
			// Notify old 'related' object of the terminated relation
			_.each( this.getReverseRelations(), function( relation ) {
					relation.removeRelated( this.instance, options );
				}, this );
			
			// Replace 'this.related' by 'attr' if it is a Backbone.Collection
			if ( attr instanceof Backbone.Collection ) {
				this.prepareCollection( attr );
				this.related = attr;
			}
			// Otherwise, 'attr' should be an array of related object ids.
			// Re-use the current 'this.related' if it is a Backbone.Collection.
			else {
				var coll = this.related instanceof Backbone.Collection ? this.related : new this.collectionType();
				this.setRelated( this.prepareCollection( coll ) );
				this.findRelated( options );
			}
			
			// Notify new 'related' object of the new relation
			_.each( this.getReverseRelations(), function( relation ) {
					relation.addRelated( this.instance, options );
				}, this );
			
			var dit = this;
			Backbone.Relational.eventQueue.add( function() {
				!options.silentChange && dit.instance.trigger( 'update:' + dit.key, dit.instance, dit.related, options );
			});
		},
		
		tryAddRelated: function( model, options ) {
			options = this.sanitizeOptions( options );
			if ( !this.related.getByCid( model ) && !this.related.get( model ) ) {
				// Check if this new model was specified in 'this.keyContents'
				var item = _.any( this.keyContents, function( item ) {
					var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
					return id && id === model.id;
				}, this );
				
				if ( item ) {
					this.related._add( model, options );
				}
			}
		},
		
		/**
		 * When a model is added to a 'HasMany', trigger 'add' on 'this.instance' and notify reverse relations.
		 * (should be 'HasOne', must set 'this.instance' as their related).
		 */
		handleAddition: function( model, coll, options ) {
			//console.debug('handleAddition called; args=%o', arguments);
			// Make sure the model is in fact a valid model before continuing.
			// (it can be invalid as a result of failing validation in Backbone.Collection._prepareModel)
			if( !( model instanceof Backbone.Model ) ) {
				return;
			}
			
			options = this.sanitizeOptions( options );
			var dit = this;
			
			_.each( this.getReverseRelations( model ), function( relation ) {
					relation.addRelated( this.instance, options );
				}, this );
			
			// Only trigger 'add' once the newly added model is initialized (so, has it's relations set up)
			Backbone.Relational.eventQueue.add( function() {
				!options.silentChange && dit.instance.trigger( 'add:' + dit.key, model, dit.related, options );
			});
		},
		
		/**
		 * When a model is removed from a 'HasMany', trigger 'remove' on 'this.instance' and notify reverse relations.
		 * (should be 'HasOne', which should be nullified)
		 */
		handleRemoval: function( model, coll, options ) {
			//console.debug('handleRemoval called; args=%o', arguments);
			options = this.sanitizeOptions( options );
			
			_.each( this.getReverseRelations( model ), function( relation ) {
					relation.removeRelated( this.instance, options );
				}, this );
			
			var dit = this;
			Backbone.Relational.eventQueue.add( function() {
				!options.silentChange && dit.instance.trigger( 'remove:' + dit.key, model, dit.related, options );
			});
		},
		
		addRelated: function( model, options ) {
			var dit = this;
			model.queue( function() { // Queued to avoid errors for adding 'model' to the 'this.related' set twice
				if ( dit.related && !dit.related.getByCid( model ) && !dit.related.get( model ) ) {
					dit.related._add( model, options );
				}
			});
		},
		
		removeRelated: function( model, options ) {
			if ( this.related.getByCid( model ) || this.related.get( model ) ) {
				this.related.remove( model, options );
			}
		}
	});
	
	/**
	 * New events:
	 *  - 'add:<key>' (model, related collection, options)
	 *  - 'remove:<key>' (model, related collection, options)
	 *  - 'update:<key>' (model, related model or collection, options)
	 */
	Backbone.RelationalModel = Backbone.Model.extend({
		relations: null, // Relation descriptions on the prototype
		_relations: null, // Relation instances
		_isInitialized: false,
		_deferProcessing: false,
		_queue: null,
		
		constructor: function( attributes, options ) {
			// Nasty hack, for cases like 'model.get( <HasMany key> ).add( item )'.
			// Defer 'processQueue', so that when 'Relation.createModels' is used we:
			// a) Survive 'Backbone.Collection._add'; this takes care we won't error on "can't add model to a set twice"
			//    (by creating a model from properties, having the model add itself to the collection via one of
			//    it's relations, then trying to add it to the collection).
			// b) Trigger 'HasMany' collection events only after the model is really fully set up.
			// Example that triggers both a and b: "p.get('jobs').add( { company: c, person: p } )".
			var dit = this;
			if ( options && options.collection ) {
				this._deferProcessing = true;
				
				var processQueue = function( model, coll ) {
					if ( model === dit ) {
						dit._deferProcessing = false;
						dit.processQueue();
						options.collection.unbind( 'relational:add', processQueue );
					}
				};
				options.collection.bind( 'relational:add', processQueue );
				
				// So we do process the queue eventually, regardless of whether this model really gets added to 'options.collection'.
				_.defer( function() {
					processQueue( dit );
				});
			}
			
			this._queue = new Backbone.BlockingQueue();
			this._queue.block();
			Backbone.Relational.eventQueue.block();
			
			Backbone.Model.prototype.constructor.apply( this, arguments );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
		},
		
		/**
		 * Override 'trigger' to queue 'change' and 'change:*' events
		 */
		trigger: function( eventName ) {
			if ( eventName.length > 5 && 'change' === eventName.substr( 0, 6 ) ) {
				var dit = this, args = arguments;
				Backbone.Relational.eventQueue.add( function() {
						Backbone.Model.prototype.trigger.apply( dit, args );
					});
			}
			else {
				Backbone.Model.prototype.trigger.apply( this, arguments );
			}
			
			return this;
		},
		
		/**
		 * Initialize Relations present in this.relations; determine the type (HasOne/HasMany), then creates a new instance.
		 * Invoked in the first call so 'set' (which is made from the Backbone.Model constructor).
		 */
		initializeRelations: function() {
			this.acquire(); // Setting up relations often also involve calls to 'set', and we only want to enter this function once
			this._relations = [];
			
			_.each( this.relations, function( rel ) {
					var type = !_.isString( rel.type ) ? rel.type :	Backbone[ rel.type ] || Backbone.Relational.store.getObjectByName( rel.type );
					if ( type && type.prototype instanceof Backbone.Relation.prototype.constructor ) {
						new type( this, rel ); // Also pushes the new Relation into _relations
					}
					else {
						console && console.warn( 'Relation=%o; missing or invalid type!', rel );
					}
				}, this );
			
			this._isInitialized = true;
			this.release();
			this.processQueue();
		},
		
		/**
		 * When new values are set, notify this model's relations (also if options.silent is set).
		 * (Relation.setRelated locks this model before calling 'set' on it to prevent loops)
		 */
		updateRelations: function( options ) {
			if( this._isInitialized && !this.isLocked() ) {
				_.each( this._relations, function( rel ) {
					var val = this.attributes[ rel.key ];
					if ( rel.related !== val ) {
						this.trigger('relational:change:' + rel.key, this, val, options || {} );
					}
				}, this );
			}
		},
		
		/**
		 * Either add to the queue (if we're not initialized yet), or execute right away.
		 */
		queue: function( func ) {
			this._queue.add( func );
		},
		
		/**
		 * Process _queue
		 */
		processQueue: function() {
			if ( this._isInitialized && !this._deferProcessing && this._queue.isBlocked() ) {
				this._queue.unblock();
			}
		},
		
		/**
		 * Get a specific relation.
		 * @param key {string} The relation key to look for.
		 * @return {Backbone.Relation|null} An instance of 'Backbone.Relation', if a relation was found for 'key', or null.
		 */
		getRelation: function( key ) {
			return _.detect( this._relations, function( rel ) {
					if ( rel.key === key ) {
						return true;
					}
				}, this );
		},
		
		/**
		 * Get all of the created relations.
		 * @return {array of Backbone.Relation}
		 */
		getRelations: function() {
			return this._relations;
		},
		
		/**
		 * Retrieve related objects.
		 * @param key {string} The relation key to fetch models for.
		 * @param options {object} Options for 'Backbone.Model.fetch' and 'Backbone.sync'.
		 * @return {xhr} An array of request objects
		 */
		fetchRelated: function( key, options ) {
			options || ( options = {} );
			var rel = this.getRelation( key ),
				keyContents = rel && rel.keyContents,
				toFetch = keyContents && _.select( _.isArray( keyContents ) ? keyContents : [ keyContents ], function( item ) {
						var id = _.isString( item ) || _.isNumber( item ) ? item : item[ rel.relatedModel.prototype.idAttribute ];
						return id && !Backbone.Relational.store.find( rel.relatedModel, id );
					}, this );
			
			if ( toFetch && toFetch.length ) {
				// Create a model for each entry in 'keyContents' that is to be fetched
				var models = _.map( toFetch, function( item ) {
						if ( typeof( item ) === 'object' ) {
							var model = new rel.relatedModel( item );
						}
						else {
							var attrs = {};
							attrs[ rel.relatedModel.prototype.idAttribute ] = item;
							var model = new rel.relatedModel( attrs );
						}
						return model;
					}, this );
				
				// Try if the 'collection' can provide a url to fetch a set of models in one request.
				if ( rel.related instanceof Backbone.Collection && _.isFunction( rel.related.url ) ) {
					var setUrl = rel.related.url( models );
				}
				
				// An assumption is that when 'Backbone.Collection.url' is a function, it can handle building of set urls.
				// To make sure it can, test if the url we got by supplying a list of models to fetch is different from
				// the one supplied for the default fetch action (without args to 'url').
				if ( setUrl && setUrl !== rel.related.url() ) {
					var opts = _.defaults( {
							error: function() {
									var args = arguments;
									_.each( models, function( model ) {
											model.destroy();
											options.error && options.error.apply( model, args );
										})
								},
							url: setUrl
						},
						options,
						{ add: true }
					);
					
					var requests = [ rel.related.fetch( opts ) ];
				}
				else {
					var requests = _.map( models, function( model ) {
							var opts = _.defaults( {
								error: function() {
										model.destroy();
										options.error && options.error.apply( model, arguments );
									}
								},
								options
							);
							return model.fetch( opts );
						}, this );
				}
			}
			
			return _.isUndefined( requests ) ? [] : requests;
		},
		
		set: function( attributes, options ) {
			Backbone.Relational.eventQueue.block();
			
			var result = Backbone.Model.prototype.set.apply( this, arguments );
			
			// 'set' is called quite late in 'Backbone.Model.prototype.constructor', but before 'initialize'.
			// Ideal place to set up relations :)
			if ( !this._isInitialized && !this.isLocked() ) {
				Backbone.Relational.store.register( this );
				this.initializeRelations();
			}
			// Update the 'idAttribute' in Backbone.store if; we don't want it to miss an 'id' update due to {silent:true}
			else if ( attributes && this.idAttribute in attributes ) {
				Backbone.Relational.store.update( this );
			}
			
			this.updateRelations( options );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
			
			return result;
		},
		
		unset: function( attributes, options ) {
			Backbone.Relational.eventQueue.block();
			
			var result = Backbone.Model.prototype.unset.apply( this, arguments );
			this.updateRelations( options );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
			
			return result;
		},
		
		clear: function( options ) {
			Backbone.Relational.eventQueue.block();
			
			var result = Backbone.Model.prototype.clear.apply( this, arguments );
			this.updateRelations( options );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
			
			return result;
		},
		
		/**
		 * Override 'change', so the change will only execute after 'set' has finised (relations are updated),
		 * and 'previousAttributes' will be available when the event is fired.
		 */
		change: function( options ) {
			var dit = this;
			Backbone.Relational.eventQueue.add( function() {
					Backbone.Model.prototype.change.apply( dit, arguments );
				});
		},
		
		/**
		 * Convert relations to JSON, omits them when required
		 */
		toJSON: function() {
			// If this Model has already been fully serialized in this branch once, return to avoid loops
			if ( this.isLocked() ) {
				return this.id;
			}
			
			this.acquire();
			var json = Backbone.Model.prototype.toJSON.call( this );
			
			_.each( this._relations, function( rel ) {
					var value = json[ rel.key ];
					
					if ( rel.options.includeInJSON === true && value && _.isFunction( value.toJSON ) ) {
						json[ rel.key ] = value.toJSON();
					}
					else if ( _.isString( rel.options.includeInJSON ) ) {
						if ( value instanceof Backbone.Collection ) {
							json[ rel.key ] = value.pluck( rel.options.includeInJSON );
						}
						else if ( value instanceof Backbone.Model ) {
							json[ rel.key ] = value.get( rel.options.includeInJSON );
						}
					}
					else if ( _.isArray( rel.options.includeInJSON ) ) { // JA added
                        if ( value instanceof Backbone.Collection ) {
                            json[ rel.key ] = _.map(value.models, function(model) {
                                var model_subset = {};
                                _.each(rel.options.includeInJSON, function(key) {
                                    model_subset[ key ] = model.get( key );
                                })
                                return model_subset;
                            })
                        }
                        else if ( value instanceof Backbone.Model ) {
                            json[ rel.key ] = {};
                            _.each(rel.options.includeInJSON, function(key) {
                                json[ rel.key ][ key ] = value.get( key );
                            })
                        }
					}
					else {
						delete json[ rel.key ];
					}
				}, this );
			
			this.release();
			return json;
		}
	});
	_.extend( Backbone.RelationalModel.prototype, Backbone.Semaphore );
	
	/**
	 * Override Backbone.Collection._add, so objects fetched from the server multiple times will
	 * update the existing Model. Also, trigger 'relation:add'.
	 */
	var _add = Backbone.Collection.prototype._add;
	Backbone.Collection.prototype._add = function( model, options ) {
		if ( !( model instanceof Backbone.Model ) ) {
			// Try to find 'model' in Backbone.store. If it already exists, set the new properties on it.
			var found = Backbone.Relational.store.find( this.model, model[ this.model.prototype.idAttribute ] );
			if ( found ) {
				model = found.set( model, options );
			}
		}
		
		//console.debug( 'calling _add on coll=%o; model=%s (%o), options=%o', this, model.cid, model, options );
		if ( !( model instanceof Backbone.Model ) || !( this.get( model ) || this.getByCid( model ) ) ) {
			model = _add.call( this, model, options );
		}
		model && this.trigger('relational:add', model, this, options);
		
		return model;
	};
	
	/**
	 * Override 'Backbone.Collection._remove' to trigger 'relation:remove'.
	 */
	var _remove = Backbone.Collection.prototype._remove;
	Backbone.Collection.prototype._remove = function( model, options ) {
		//console.debug('calling _remove on coll=%o; model=%s (%o), options=%o', this, model.cid, model, options );
		model = _remove.call( this, model, options );
		model && this.trigger('relational:remove', model, this, options);
		
		return model;
	};
	
	/**
	 * Override 'Backbone.Collection.trigger' so 'add', 'remove' and 'reset' events are queued until relations
	 * are ready.
	 */
	var _trigger = Backbone.Collection.prototype.trigger;
	Backbone.Collection.prototype.trigger = function( eventName ) {
		if ( eventName === 'add' || eventName === 'remove' || eventName === 'reset' ) {
			var dit = this, args = arguments;
			Backbone.Relational.eventQueue.add( function() {
					_trigger.apply( dit, args );
				});
		}
		else {
			_trigger.apply( this, arguments );
		}
		
		return this;
	};
})();
;

// Backbone.Memento v0.4.1
//
// Copyright (C)2011 Derick Bailey, Muted Solutions, LLC
// Distributed Under MIT Liscene
//
// Documentation and Full Licence Availabe at:
// http://github.com/derickbailey/backbone.memento

Backbone.Memento = (function(Backbone, _){
  'use strict';

  // ----------------------------
  // Memento: the public API
  // ----------------------------
  var Memento = function(structure, config){
    this.version = "0.4.1";

    config = _.extend({ignore: []}, config);

    var serializer = new Serializer(structure, config);
    var mementoStack = new MementoStack(structure, config);

    var restoreState = function (previousState, restoreConfig){
      if (!previousState){ return; }
      serializer.deserialize(previousState, restoreConfig);
    };

    this.store = function(){
      var currentState = serializer.serialize();
      mementoStack.push(currentState);
    };

    this.restore = function(restoreConfig){
      var previousState = mementoStack.pop();
      restoreState(previousState, restoreConfig);
    };

    this.restart = function(restoreConfig){
      var previousState = mementoStack.rewind();
      restoreState(previousState, restoreConfig);
    };
  };

  // ----------------------------
  // TypeHelper: a consistent API for removing attributes and
  // restoring attributes, on models and collections
  // ----------------------------
  var TypeHelper = function(structure){
    if (structure instanceof Backbone.Model) {
      this.removeAttr = function(data){ structure.unset(data); };
      this.restore = function(data){ structure.set(data); };
    } else {
      this.removeAttr = function(data){ structure.remove(data); };
      this.restore = function(data){ structure.reset(data); };
    }
  };

  // ----------------------------
  // Serializer: serializer and deserialize model and collection state
  // ----------------------------
  var Serializer = function(structure, config){
    var typeHelper = new TypeHelper(structure);

    function dropIgnored(attrs, restoreConfig){
      attrs = _.clone(attrs);
      if (restoreConfig.hasOwnProperty("ignore") && restoreConfig.ignore.length > 0){
        for(var index in restoreConfig.ignore){
          var ignore = restoreConfig.ignore[index];
          delete attrs[ignore];
        }
      }
      return attrs;
    }

    function getAddedAttrDiff(newAttrs, oldAttrs){
      var removedAttrs = [];

      // guard clause to ensure we have attrs to compare
      if (!newAttrs || !oldAttrs){
        return removedAttrs;
      }

      // if the attr is found in the old set but not in
      // the new set, then it was remove in the new set
      for (var attr in oldAttrs){
        if (oldAttrs.hasOwnProperty(attr)){
          if (!newAttrs.hasOwnProperty(attr)){
            removedAttrs.push(attr);
          }
        }
      }

      return removedAttrs;
    }

    function removeAttributes(structure, attrsToRemove){
      for (var index in attrsToRemove){
        var attr = attrsToRemove[index];
        typeHelper.removeAttr(attr);
      }
    }

    function restoreState(previousState, restoreConfig){
      var oldAttrs = dropIgnored(previousState, restoreConfig);

      //get the current state
      var currentAttrs = structure.toJSON();
      currentAttrs = dropIgnored(currentAttrs, restoreConfig);

      //handle removing attributes that were added
      var removedAttrs = getAddedAttrDiff(oldAttrs, currentAttrs);
      removeAttributes(structure, removedAttrs);

      typeHelper.restore(oldAttrs);
    }

    this.serialize = function(){
      var attrs = structure.toJSON();
      attrs = dropIgnored(attrs, config);
      return attrs;
    }

    this.deserialize = function(previousState, restoreConfig){
      restoreConfig = _.extend({}, config, restoreConfig);
      restoreState(previousState, restoreConfig);
    }
      
  };

  // ----------------------------
  // MementoStack: push / pop model and collection states
  // ----------------------------
  var MementoStack = function(structure, config){
    var attributeStack;

    function initialize(){
      attributeStack = [];
    }

    this.push = function(attrs){
      attributeStack.push(attrs);
    }
    
    this.pop = function(restoreConfig){
      var oldAttrs = attributeStack.pop();
      return oldAttrs;
    }

    this.rewind = function(){
      var oldAttrs = attributeStack[0];
      initialize();
      return oldAttrs;
    }

    initialize();
  };

  return Memento;
})(Backbone, _);
;

// Backbone.ModelBinding v0.4.1
//
// Copyright (C)2011 Derick Bailey, Muted Solutions, LLC
// Distributed Under MIT Liscene
//
// Documentation and Full Licence Availabe at:
// http://github.com/derickbailey/backbone.modelbinding

// ----------------------------
// Backbone.ModelBinding
// ----------------------------

Backbone.ModelBinding = (function(Backbone, _, $){
  modelBinding = {
    version: "0.4.1",

    bind: function(view, options){
      view.modelBinder = new ModelBinder(view, options);
      view.modelBinder.bind();
    },

    unbind: function(view){
      if (view.modelBinder){
        view.modelBinder.unbind()
      }
    }
  };

  ModelBinder = function(view, options){
    this.config = new modelBinding.Configuration(options);
    this.modelBindings = [];
    this.elementBindings = [];

    this.bind = function(){
      var conventions = modelBinding.Conventions;
      for (var conventionName in conventions){
        if (conventions.hasOwnProperty(conventionName)){
          var conventionElement = conventions[conventionName];
          var handler = conventionElement.handler;
          var conventionSelector = conventionElement.selector;
          handler.bind.call(this, conventionSelector, view, view.model, this.config);
        }
      }
    }

    this.unbind = function(){
      // unbind the html element bindings
      _.each(this.elementBindings, function(binding){
        binding.element.unbind(binding.eventName, binding.callback);
      });

      // unbind the model bindings
      _.each(this.modelBindings, function(binding){
        binding.model.unbind(binding.eventName, binding.callback);
      });
    }

    this.registerModelBinding = function(model, attribute_name, callback){
      // bind the model changes to the form elements
      var eventName = "change:" + attribute_name;
      model.bind(eventName, callback);
      this.modelBindings.push({model: model, eventName: eventName, callback: callback});
    }

    this.registerElementBinding = function(element, callback){
      // bind the form changes to the model
      element.bind("change", callback);
      this.elementBindings.push({element: element, eventName: "change", callback: callback});
    }
  }

  // ----------------------------
  // Model Binding Configuration
  // ----------------------------
  modelBinding.Configuration = function(options){
    this.bindingAttrConfig = {};

    _.extend(this.bindingAttrConfig, 
      modelBinding.Configuration.bindindAttrConfig,
      options
    );

    if (this.bindingAttrConfig.all){
      var attr = this.bindingAttrConfig.all;
      delete this.bindingAttrConfig.all;
      for (var inputType in this.bindingAttrConfig){
        if (this.bindingAttrConfig.hasOwnProperty(inputType)){
          this.bindingAttrConfig[inputType] = attr;
        }
      }
    }

    this.getBindingAttr = function(type){ 
      return this.bindingAttrConfig[type]; 
    };

    this.getBindingValue = function(element, type){
      var bindingAttr = this.getBindingAttr(type);
      return element.attr(bindingAttr);
    };

  };

  modelBinding.Configuration.bindindAttrConfig = {
    text: "id",
    textarea: "id",
    password: "id",
    radio: "name",
    checkbox: "id",
    select: "id",
    number: "id",
    range: "id",
    tel: "id",
    search: "id",
    url: "id",
    email: "id"

  };

  modelBinding.Configuration.store = function(){
    modelBinding.Configuration.originalConfig = _.clone(modelBinding.Configuration.bindindAttrConfig);
  };

  modelBinding.Configuration.restore = function(){
    modelBinding.Configuration.bindindAttrConfig = modelBinding.Configuration.originalConfig;
  };

  modelBinding.Configuration.configureBindingAttributes = function(options){
    if (options.all){
      this.configureAllBindingAttributes(options.all);
      delete options.all;
    }
    _.extend(modelBinding.Configuration.bindindAttrConfig, options);
  };

  modelBinding.Configuration.configureAllBindingAttributes = function(attribute){
    var config = modelBinding.Configuration.bindindAttrConfig;
    config.text = attribute;
    config.textarea = attribute;
    config.password = attribute;
    config.radio = attribute;
    config.checkbox = attribute;
    config.select = attribute;
    config.number = attribute;
    config.range = attribute;
    config.tel = attribute;
    config.search = attribute;
    config.url = attribute;
    config.email = attribute;
  };

  // ----------------------------
  // Text, Textarea, and Password Bi-Directional Binding Methods
  // ----------------------------
  StandardBinding = (function(Backbone){
    var methods = {};

    var _getElementType = function(element) {
      var type = element[0].tagName.toLowerCase();
      if (type == "input"){
        type = element.attr("type");
        if (type == undefined || type == ''){
          type = 'text';
        }
      }
      return type;
    };

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var elementType = _getElementType(element);
        var attribute_name = config.getBindingValue(element, elementType);

        var modelChange = function(changed_model, val){ element.val(val); };

        var setModelValue = function(attr_name, value){
          var data = {};
          data[attr_name] = value;
          model.set(data);
        };

        var elementChange = function(ev){
          setModelValue(attribute_name, view.$(ev.target).val());
        };

        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);

        // set the default value on the form, from the model
        var attr_value = model.get(attribute_name);
        if (typeof attr_value !== "undefined" && attr_value !== null) {
          element.val(attr_value);
        } else {
          var elVal = element.val();
          if (elVal){
            setModelValue(attribute_name, elVal);
          }
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Select Box Bi-Directional Binding Methods
  // ----------------------------
  SelectBoxBinding = (function(Backbone){
    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var attribute_name = config.getBindingValue(element, 'select');

        var modelChange = function(changed_model, val){ element.val(val); };

        var setModelValue = function(attr, val, text){
          var data = {};
          data[attr] = val;
          data[attr + "_text"] = text;
          model.set(data);
        };

        var elementChange = function(ev){
          var targetEl = view.$(ev.target);
          var value = targetEl.val();
          var text = targetEl.find(":selected").text();
          setModelValue(attribute_name, value, text);
        };

        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);

        // set the default value on the form, from the model
        var attr_value = model.get(attribute_name);
        if (typeof attr_value !== "undefined" && attr_value !== null) {
          element.val(attr_value);
        } 

        // set the model to the form's value if there is no model value
        if (element.val() != attr_value) {
          var value = element.val();
          var text = element.find(":selected").text();
          setModelValue(attribute_name, value, text);
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Radio Button Group Bi-Directional Binding Methods
  // ----------------------------
  RadioGroupBinding = (function(Backbone){
    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      var foundElements = [];
      view.$(selector).each(function(index){
        var element = view.$(this);

        var group_name = config.getBindingValue(element, 'radio');
        if (!foundElements[group_name]) {
          foundElements[group_name] = true;
          var bindingAttr = config.getBindingAttr('radio');

          var modelChange = function(model, val){
            var value_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "][value=" + val + "]";
            view.$(value_selector).attr("checked", "checked");
          };
          modelBinder.registerModelBinding(model, group_name, modelChange);

          var setModelValue = function(attr, val){
            var data = {};
            data[attr] = val;
            model.set(data);
          };

          // bind the form changes to the model
          var elementChange = function(ev){
            var element = view.$(ev.currentTarget);
            if (element.is(":checked")){
              setModelValue(group_name, element.val());
            }
          };

          var group_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "]";
          view.$(group_selector).each(function(){
            var groupEl = $(this);
            modelBinder.registerElementBinding(groupEl, elementChange);
          });

          var attr_value = model.get(group_name);
          if (typeof attr_value !== "undefined" && attr_value !== null) {
            // set the default value on the form, from the model
            var value_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "][value=" + attr_value + "]";
            view.$(value_selector).attr("checked", "checked");
          } else {
            // set the model to the currently selected radio button
            var value_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "]:checked";
            var value = view.$(value_selector).val();
            setModelValue(group_name, value);
          }
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Checkbox Bi-Directional Binding Methods
  // ----------------------------
  CheckboxBinding = (function(Backbone){
    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var bindingAttr = config.getBindingAttr('checkbox');
        var attribute_name = config.getBindingValue(element, 'checkbox');

        var modelChange = function(model, val){
          if (val){
            element.attr("checked", "checked");
          }
          else{
            element.removeAttr("checked");
          }
        };

        var setModelValue = function(attr_name, value){
          var data = {};
          data[attr_name] = value;
          model.set(data);
        };

        var elementChange = function(ev){
          var changedElement = view.$(ev.target);
          var checked = changedElement.is(":checked")? true : false;
          setModelValue(attribute_name, checked);
        };

        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);

        var attr_exists = model.attributes.hasOwnProperty(attribute_name);
        if (attr_exists) {
          // set the default value on the form, from the model
          var attr_value = model.get(attribute_name);
          if (typeof attr_value !== "undefined" && attr_value !== null && attr_value != false) {
            element.attr("checked", "checked");
          }
          else{
            element.removeAttr("checked");
          }
        } else {
          // bind the form's value to the model
          var checked = element.is(":checked")? true : false;
          setModelValue(attribute_name, checked);
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Data-Bind Binding Methods
  // ----------------------------
  DataBindBinding = (function(Backbone, _, $){
    var dataBindSubstConfig = {
      "default": ""
    };

    modelBinding.Configuration.dataBindSubst = function(config){
      this.storeDataBindSubstConfig();
      _.extend(dataBindSubstConfig, config);
    };

    modelBinding.Configuration.storeDataBindSubstConfig = function(){
      modelBinding.Configuration._dataBindSubstConfig = _.clone(dataBindSubstConfig);
    };

    modelBinding.Configuration.restoreDataBindSubstConfig = function(){
      if (modelBinding.Configuration._dataBindSubstConfig){
        dataBindSubstConfig = modelBinding.Configuration._dataBindSubstConfig;
        delete modelBinding.Configuration._dataBindSubstConfig;
      }
    };

    modelBinding.Configuration.getDataBindSubst = function(elementType, value){
      var returnValue = value;
      if (value === undefined){
        if (dataBindSubstConfig.hasOwnProperty(elementType)){
          returnValue = dataBindSubstConfig[elementType];
        } else {
          returnValue = dataBindSubstConfig["default"];
        }
      }
      return returnValue;
    };

    setOnElement = function(element, attr, val){
      var valBefore = val;
      val = modelBinding.Configuration.getDataBindSubst(attr, val);
      switch(attr){
        case "html":
          element.html(val);
          break;
        case "text":
          element.text(val);
          break;
        case "enabled":
          element.attr("disabled", !val);
          break;
        case "displayed":
          element[val? "show" : "hide"]();
          break;
        case "hidden":
          element[val? "hide" : "show"]();
          break;
        default:
          element.attr(attr, val);
      }
    };

    splitBindingAttr = function(element)
    {
      var dataBindConfigList = [];
      var databindList = element.attr("data-bind").split(";");
      _.each(databindList, function(attrbind){
        var databind = $.trim(attrbind).split(" ");

        // make the default special case "text" if none specified
        if( databind.length == 1 ) databind.unshift("text");

        dataBindConfigList.push({
          elementAttr: databind[0],
          modelAttr: databind[1]
        });
      });
      return dataBindConfigList;
    };

    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var databindList = splitBindingAttr(element);

        _.each(databindList, function(databind){
          var modelChange = function(model, val){
            setOnElement(element, databind.elementAttr, val);
          };

          modelBinder.registerModelBinding(model, databind.modelAttr, modelChange);

          // set default on data-bind element
          setOnElement(element, databind.elementAttr, model.get(databind.modelAttr));
        });

      });
    };

    return methods;
  })(Backbone, _, $);


  // ----------------------------
  // Binding Conventions
  // ----------------------------
  modelBinding.Conventions = {
    text: {selector: "input:text", handler: StandardBinding},
    textarea: {selector: "textarea", handler: StandardBinding},
    password: {selector: "input:password", handler: StandardBinding},
    radio: {selector: "input:radio", handler: RadioGroupBinding},
    checkbox: {selector: "input:checkbox", handler: CheckboxBinding},
    select: {selector: "select", handler: SelectBoxBinding},
    databind: { selector: "*[data-bind]", handler: DataBindBinding},
    // HTML5 input
    number: {selector: "input[type=number]", handler: StandardBinding},
    range: {selector: "input[type=range]", handler: StandardBinding},
    tel: {selector: "input[type=tel]", handler: StandardBinding},
    search: {selector: "input[type=search]", handler: StandardBinding},
    url: {selector: "input[type=url]", handler: StandardBinding},
    email: {selector: "input[type=email]", handler: StandardBinding}
  };

  return modelBinding;
})(Backbone, _, jQuery);

;

var Handlebars = {};

Handlebars.VERSION = "1.0.beta.2";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = Object.prototype.toString.call(context);

  if(type === "[object Function]") {
    context = context();
  }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});


Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials) {
    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, {helpers: helpers, partials: partials});
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in vm mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, {helpers: helpers, partials: partials});
    }
  }
};

Handlebars.template = Handlebars.VM.template;;

/* ============================================================
 * bootstrap-buttons.js v1.4.0
 * http://twitter.github.com/bootstrap/javascript.html#buttons
 * ============================================================
 * Copyright 2011 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function( $ ){

  "use strict"

  function setState(el, state) {
    var d = 'disabled'
      , $el = $(el)
      , data = $el.data()

    state = state + 'Text'
    data.resetText || $el.data('resetText', $el.html())

    $el.html( data[state] || $.fn.button.defaults[state] )

    state == 'loadingText' ?
      $el.addClass(d).attr(d, d) :
      $el.removeClass(d).removeAttr(d)
  }

  function toggle(el) {
    $(el).toggleClass('active')
  }

  $.fn.button = function(options) {
    return this.each(function () {
      if (options == 'toggle') {
        return toggle(this)
      }
      options && setState(this, options)
    })
  }

  $.fn.button.defaults = {
    loadingText: 'loading...'
  }

  $(function () {
    $('body').delegate('.btn[data-toggle]', 'click', function () {
      $(this).button('toggle')
    })
  })

}( window.jQuery || window.ender );;

/*
 * FancyBox - jQuery Plugin
 * Simple and fancy lightbox alternative
 *
 * Examples and documentation at: http://fancybox.net
 *
 * Copyright (c) 2008 - 2010 Janis Skarnelis
 * That said, it is hardly a one-person project. Many people have submitted bugs, code, and offered their advice freely. Their support is greatly appreciated.
 *
 * Version: 1.3.4 (11/11/2010)
 * Requires: jQuery v1.3+
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

;(function($) {
	var tmp, loading, overlay, wrap, outer, content, close, title, nav_left, nav_right,

		selectedIndex = 0, selectedOpts = {}, selectedArray = [], currentIndex = 0, currentOpts = {}, currentArray = [],

		ajaxLoader = null, imgPreloader = new Image(), imgRegExp = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i, swfRegExp = /[^\.]\.(swf)\s*$/i,

		loadingTimer, loadingFrame = 1,

		titleHeight = 0, titleStr = '', start_pos, final_pos, busy = false, fx = $.extend($('<div/>')[0], { prop: 0 }),

		isIE6 = $.browser.msie && $.browser.version < 7 && !window.XMLHttpRequest,

		/*
		 * Private methods 
		 */

		_abort = function() {
			loading.hide();

			imgPreloader.onerror = imgPreloader.onload = null;

			if (ajaxLoader) {
				ajaxLoader.abort();
			}

			tmp.empty();
		},

		_error = function() {
			if (false === selectedOpts.onError(selectedArray, selectedIndex, selectedOpts)) {
				loading.hide();
				busy = false;
				return;
			}

			selectedOpts.titleShow = false;

			selectedOpts.width = 'auto';
			selectedOpts.height = 'auto';

			tmp.html( '<p id="fancybox-error">The requested content cannot be loaded.<br />Please try again later.</p>' );

			_process_inline();
		},

		_start = function() {
			var obj = selectedArray[ selectedIndex ],
				href, 
				type, 
				title,
				str,
				emb,
				ret;

			_abort();

			selectedOpts = $.extend({}, $.fn.fancybox.defaults, (typeof $(obj).data('fancybox') == 'undefined' ? selectedOpts : $(obj).data('fancybox')));

			ret = selectedOpts.onStart(selectedArray, selectedIndex, selectedOpts);

			if (ret === false) {
				busy = false;
				return;
			} else if (typeof ret == 'object') {
				selectedOpts = $.extend(selectedOpts, ret);
			}

			title = selectedOpts.title || (obj.nodeName ? $(obj).attr('title') : obj.title) || '';

			if (obj.nodeName && !selectedOpts.orig) {
				selectedOpts.orig = $(obj).children("img:first").length ? $(obj).children("img:first") : $(obj);
			}

			if (title === '' && selectedOpts.orig && selectedOpts.titleFromAlt) {
				title = selectedOpts.orig.attr('alt');
			}

			href = selectedOpts.href || (obj.nodeName ? $(obj).attr('href') : obj.href) || null;

			if ((/^(?:javascript)/i).test(href) || href == '#') {
				href = null;
			}

			if (selectedOpts.type) {
				type = selectedOpts.type;

				if (!href) {
					href = selectedOpts.content;
				}

			} else if (selectedOpts.content) {
				type = 'html';

			} else if (href) {
				if (href.match(imgRegExp)) {
					type = 'image';

				} else if (href.match(swfRegExp)) {
					type = 'swf';

				} else if ($(obj).hasClass("iframe")) {
					type = 'iframe';

				} else if (href.indexOf("#") === 0) {
					type = 'inline';

				} else {
					type = 'ajax';
				}
			}

			if (!type) {
				_error();
				return;
			}

			if (type == 'inline') {
				obj	= href.substr(href.indexOf("#"));
				type = $(obj).length > 0 ? 'inline' : 'ajax';
			}

			selectedOpts.type = type;
			selectedOpts.href = href;
			selectedOpts.title = title;

			if (selectedOpts.autoDimensions) {
				if (selectedOpts.type == 'html' || selectedOpts.type == 'inline' || selectedOpts.type == 'ajax') {
					selectedOpts.width = 'auto';
					selectedOpts.height = 'auto';
				} else {
					selectedOpts.autoDimensions = false;	
				}
			}

			if (selectedOpts.modal) {
				selectedOpts.overlayShow = true;
				selectedOpts.hideOnOverlayClick = false;
				selectedOpts.hideOnContentClick = false;
				selectedOpts.enableEscapeButton = false;
				selectedOpts.showCloseButton = false;
			}

			selectedOpts.padding = parseInt(selectedOpts.padding, 10);
			selectedOpts.margin = parseInt(selectedOpts.margin, 10);

			tmp.css('padding', (selectedOpts.padding + selectedOpts.margin));

			$('.fancybox-inline-tmp').unbind('fancybox-cancel').bind('fancybox-change', function() {
				$(this).replaceWith(content.children());				
			});

			switch (type) {
				case 'html' :
					tmp.html( selectedOpts.content );
					_process_inline();
				break;

				case 'inline' :
					if ( $(obj).parent().is('#fancybox-content') === true) {
						busy = false;
						return;
					}

					$('<div class="fancybox-inline-tmp" />')
						.hide()
						.insertBefore( $(obj) )
						.bind('fancybox-cleanup', function() {
							$(this).replaceWith(content.children());
						}).bind('fancybox-cancel', function() {
							$(this).replaceWith(tmp.children());
						});

					$(obj).appendTo(tmp);

					_process_inline();
				break;

				case 'image':
					busy = false;

					$.fancybox.showActivity();

					imgPreloader = new Image();

					imgPreloader.onerror = function() {
						_error();
					};

					imgPreloader.onload = function() {
						busy = true;

						imgPreloader.onerror = imgPreloader.onload = null;

						_process_image();
					};

					imgPreloader.src = href;
				break;

				case 'swf':
					selectedOpts.scrolling = 'no';

					str = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"><param name="movie" value="' + href + '"></param>';
					emb = '';

					$.each(selectedOpts.swf, function(name, val) {
						str += '<param name="' + name + '" value="' + val + '"></param>';
						emb += ' ' + name + '="' + val + '"';
					});

					str += '<embed src="' + href + '" type="application/x-shockwave-flash" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"' + emb + '></embed></object>';

					tmp.html(str);

					_process_inline();
				break;

				case 'ajax':
					busy = false;

					$.fancybox.showActivity();

					selectedOpts.ajax.win = selectedOpts.ajax.success;

					ajaxLoader = $.ajax($.extend({}, selectedOpts.ajax, {
						url	: href,
						data : selectedOpts.ajax.data || {},
						error : function(XMLHttpRequest, textStatus, errorThrown) {
							if ( XMLHttpRequest.status > 0 ) {
								_error();
							}
						},
						success : function(data, textStatus, XMLHttpRequest) {
							var o = typeof XMLHttpRequest == 'object' ? XMLHttpRequest : ajaxLoader;
							if (o.status == 200) {
								if ( typeof selectedOpts.ajax.win == 'function' ) {
									ret = selectedOpts.ajax.win(href, data, textStatus, XMLHttpRequest);

									if (ret === false) {
										loading.hide();
										return;
									} else if (typeof ret == 'string' || typeof ret == 'object') {
										data = ret;
									}
								}

								tmp.html( data );
								_process_inline();
							}
						}
					}));

				break;

				case 'iframe':
					_show();
				break;
			}
		},

		_process_inline = function() {
			var
				w = selectedOpts.width,
				h = selectedOpts.height;

			if (w.toString().indexOf('%') > -1) {
				w = parseInt( ($(window).width() - (selectedOpts.margin * 2)) * parseFloat(w) / 100, 10) + 'px';

			} else {
				w = w == 'auto' ? 'auto' : w + 'px';	
			}

			if (h.toString().indexOf('%') > -1) {
				h = parseInt( ($(window).height() - (selectedOpts.margin * 2)) * parseFloat(h) / 100, 10) + 'px';

			} else {
				h = h == 'auto' ? 'auto' : h + 'px';	
			}

			tmp.wrapInner('<div style="width:' + w + ';height:' + h + ';overflow: ' + (selectedOpts.scrolling == 'auto' ? 'auto' : (selectedOpts.scrolling == 'yes' ? 'scroll' : 'hidden')) + ';position:relative;"></div>');

			selectedOpts.width = tmp.width();
			selectedOpts.height = tmp.height();

			_show();
		},

		_process_image = function() {
			selectedOpts.width = imgPreloader.width;
			selectedOpts.height = imgPreloader.height;

			$("<img />").attr({
				'id' : 'fancybox-img',
				'src' : imgPreloader.src,
				'alt' : selectedOpts.title
			}).appendTo( tmp );

			_show();
		},

		_show = function() {
			var pos, equal;

			loading.hide();

			if (wrap.is(":visible") && false === currentOpts.onCleanup(currentArray, currentIndex, currentOpts)) {
				$.event.trigger('fancybox-cancel');

				busy = false;
				return;
			}

			busy = true;

			$(content.add( overlay )).unbind();

			$(window).unbind("resize.fb scroll.fb");
			$(document).unbind('keydown.fb');

			if (wrap.is(":visible") && currentOpts.titlePosition !== 'outside') {
				wrap.css('height', wrap.height());
			}

			currentArray = selectedArray;
			currentIndex = selectedIndex;
			currentOpts = selectedOpts;

			if (currentOpts.overlayShow) {
				overlay.css({
					'background-color' : currentOpts.overlayColor,
					'opacity' : currentOpts.overlayOpacity,
					'cursor' : currentOpts.hideOnOverlayClick ? 'pointer' : 'auto',
					'height' : $(document).height()
				});

				if (!overlay.is(':visible')) {
					if (isIE6) {
						$('select:not(#fancybox-tmp select)').filter(function() {
							return this.style.visibility !== 'hidden';
						}).css({'visibility' : 'hidden'}).one('fancybox-cleanup', function() {
							this.style.visibility = 'inherit';
						});
					}

					overlay.show();
				}
			} else {
				overlay.hide();
			}

			final_pos = _get_zoom_to();

			_process_title();

			if (wrap.is(":visible")) {
				$( close.add( nav_left ).add( nav_right ) ).hide();

				pos = wrap.position(),

				start_pos = {
					top	 : pos.top,
					left : pos.left,
					width : wrap.width(),
					height : wrap.height()
				};

				equal = (start_pos.width == final_pos.width && start_pos.height == final_pos.height);

				content.fadeTo(currentOpts.changeFade, 0.3, function() {
					var finish_resizing = function() {
						content.html( tmp.contents() ).fadeTo(currentOpts.changeFade, 1, _finish);
					};

					$.event.trigger('fancybox-change');

					content
						.empty()
						.removeAttr('filter')
						.css({
							'border-width' : currentOpts.padding,
							'width'	: final_pos.width - currentOpts.padding * 2,
							'height' : selectedOpts.autoDimensions ? 'auto' : final_pos.height - titleHeight - currentOpts.padding * 2
						});

					if (equal) {
						finish_resizing();

					} else {
						fx.prop = 0;

						$(fx).animate({prop: 1}, {
							 duration : currentOpts.changeSpeed,
							 easing : currentOpts.easingChange,
							 step : _draw,
							 complete : finish_resizing
						});
					}
				});

				return;
			}

			wrap.removeAttr("style");

			content.css('border-width', currentOpts.padding);

			if (currentOpts.transitionIn == 'elastic') {
				start_pos = _get_zoom_from();

				content.html( tmp.contents() );

				wrap.show();

				if (currentOpts.opacity) {
					final_pos.opacity = 0;
				}

				fx.prop = 0;

				$(fx).animate({prop: 1}, {
					 duration : currentOpts.speedIn,
					 easing : currentOpts.easingIn,
					 step : _draw,
					 complete : _finish
				});

				return;
			}

			if (currentOpts.titlePosition == 'inside' && titleHeight > 0) {	
				title.show();	
			}

			content
				.css({
					'width' : final_pos.width - currentOpts.padding * 2,
					'height' : selectedOpts.autoDimensions ? 'auto' : final_pos.height - titleHeight - currentOpts.padding * 2
				})
				.html( tmp.contents() );

			wrap
				.css(final_pos)
				.fadeIn( currentOpts.transitionIn == 'none' ? 0 : currentOpts.speedIn, _finish );
		},

		_format_title = function(title) {
			if (title && title.length) {
				if (currentOpts.titlePosition == 'float') {
					return '<table id="fancybox-title-float-wrap" cellpadding="0" cellspacing="0"><tr><td id="fancybox-title-float-left"></td><td id="fancybox-title-float-main">' + title + '</td><td id="fancybox-title-float-right"></td></tr></table>';
				}

				return '<div id="fancybox-title-' + currentOpts.titlePosition + '">' + title + '</div>';
			}

			return false;
		},

		_process_title = function() {
			titleStr = currentOpts.title || '';
			titleHeight = 0;

			title
				.empty()
				.removeAttr('style')
				.removeClass();

			if (currentOpts.titleShow === false) {
				title.hide();
				return;
			}

			titleStr = $.isFunction(currentOpts.titleFormat) ? currentOpts.titleFormat(titleStr, currentArray, currentIndex, currentOpts) : _format_title(titleStr);

			if (!titleStr || titleStr === '') {
				title.hide();
				return;
			}

			title
				.addClass('fancybox-title-' + currentOpts.titlePosition)
				.html( titleStr )
				.appendTo( 'body' )
				.show();

			switch (currentOpts.titlePosition) {
				case 'inside':
					title
						.css({
							'width' : final_pos.width - (currentOpts.padding * 2),
							'marginLeft' : currentOpts.padding,
							'marginRight' : currentOpts.padding
						});

					titleHeight = title.outerHeight(true);

					title.appendTo( outer );

					final_pos.height += titleHeight;
				break;

				case 'over':
					title
						.css({
							'marginLeft' : currentOpts.padding,
							'width'	: final_pos.width - (currentOpts.padding * 2),
							'bottom' : currentOpts.padding
						})
						.appendTo( outer );
				break;

				case 'float':
					title
						.css('left', parseInt((title.width() - final_pos.width - 40)/ 2, 10) * -1)
						.appendTo( wrap );
				break;

				default:
					title
						.css({
							'width' : final_pos.width - (currentOpts.padding * 2),
							'paddingLeft' : currentOpts.padding,
							'paddingRight' : currentOpts.padding
						})
						.appendTo( wrap );
				break;
			}

			title.hide();
		},

		_set_navigation = function() {
			if (currentOpts.enableEscapeButton || currentOpts.enableKeyboardNav) {
				$(document).bind('keydown.fb', function(e) {
					if (e.keyCode == 27 && currentOpts.enableEscapeButton) {
						e.preventDefault();
						$.fancybox.close();

					} else if ((e.keyCode == 37 || e.keyCode == 39) && currentOpts.enableKeyboardNav && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
						e.preventDefault();
						$.fancybox[ e.keyCode == 37 ? 'prev' : 'next']();
					}
				});
			}

			if (!currentOpts.showNavArrows) { 
				nav_left.hide();
				nav_right.hide();
				return;
			}

			if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex !== 0) {
				nav_left.show();
			}

			if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex != (currentArray.length -1)) {
				nav_right.show();
			}
		},

		_finish = function () {
			if (!$.support.opacity) {
				content.get(0).style.removeAttribute('filter');
				wrap.get(0).style.removeAttribute('filter');
			}

			if (selectedOpts.autoDimensions) {
				content.css('height', 'auto');
			}

			wrap.css('height', 'auto');

			if (titleStr && titleStr.length) {
				title.show();
			}

			if (currentOpts.showCloseButton) {
				close.show();
			}

			_set_navigation();
	
			if (currentOpts.hideOnContentClick)	{
				content.bind('click', $.fancybox.close);
			}

			if (currentOpts.hideOnOverlayClick)	{
				overlay.bind('click', $.fancybox.close);
			}

			$(window).bind("resize.fb", $.fancybox.resize);

			if (currentOpts.centerOnScroll) {
				$(window).bind("scroll.fb", $.fancybox.center);
			}

			if (currentOpts.type == 'iframe') {
				$('<iframe id="fancybox-frame" name="fancybox-frame' + new Date().getTime() + '" frameborder="0" hspace="0" ' + ($.browser.msie ? 'allowtransparency="true""' : '') + ' scrolling="' + selectedOpts.scrolling + '" src="' + currentOpts.href + '"></iframe>').appendTo(content);
			}

			wrap.show();

			busy = false;

			$.fancybox.center();

			currentOpts.onComplete(currentArray, currentIndex, currentOpts);

			_preload_images();
		},

		_preload_images = function() {
			var href, 
				objNext;

			if ((currentArray.length -1) > currentIndex) {
				href = currentArray[ currentIndex + 1 ].href;

				if (typeof href !== 'undefined' && href.match(imgRegExp)) {
					objNext = new Image();
					objNext.src = href;
				}
			}

			if (currentIndex > 0) {
				href = currentArray[ currentIndex - 1 ].href;

				if (typeof href !== 'undefined' && href.match(imgRegExp)) {
					objNext = new Image();
					objNext.src = href;
				}
			}
		},

		_draw = function(pos) {
			var dim = {
				width : parseInt(start_pos.width + (final_pos.width - start_pos.width) * pos, 10),
				height : parseInt(start_pos.height + (final_pos.height - start_pos.height) * pos, 10),

				top : parseInt(start_pos.top + (final_pos.top - start_pos.top) * pos, 10),
				left : parseInt(start_pos.left + (final_pos.left - start_pos.left) * pos, 10)
			};

			if (typeof final_pos.opacity !== 'undefined') {
				dim.opacity = pos < 0.5 ? 0.5 : pos;
			}

			wrap.css(dim);

			content.css({
				'width' : dim.width - currentOpts.padding * 2,
				'height' : dim.height - (titleHeight * pos) - currentOpts.padding * 2
			});
		},

		_get_viewport = function() {
			return [
				$(window).width() - (currentOpts.margin * 2),
				$(window).height() - (currentOpts.margin * 2),
				$(document).scrollLeft() + currentOpts.margin,
				$(document).scrollTop() + currentOpts.margin
			];
		},

		_get_zoom_to = function () {
			var view = _get_viewport(),
				to = {},
				resize = currentOpts.autoScale,
				double_padding = currentOpts.padding * 2,
				ratio;

			if (currentOpts.width.toString().indexOf('%') > -1) {
				to.width = parseInt((view[0] * parseFloat(currentOpts.width)) / 100, 10);
			} else {
				to.width = currentOpts.width + double_padding;
			}

			if (currentOpts.height.toString().indexOf('%') > -1) {
				to.height = parseInt((view[1] * parseFloat(currentOpts.height)) / 100, 10);
			} else {
				to.height = currentOpts.height + double_padding;
			}

			if (resize && (to.width > view[0] || to.height > view[1])) {
				if (selectedOpts.type == 'image' || selectedOpts.type == 'swf') {
					ratio = (currentOpts.width ) / (currentOpts.height );

					if ((to.width ) > view[0]) {
						to.width = view[0];
						to.height = parseInt(((to.width - double_padding) / ratio) + double_padding, 10);
					}

					if ((to.height) > view[1]) {
						to.height = view[1];
						to.width = parseInt(((to.height - double_padding) * ratio) + double_padding, 10);
					}

				} else {
					to.width = Math.min(to.width, view[0]);
					to.height = Math.min(to.height, view[1]);
				}
			}

			to.top = parseInt(Math.max(view[3] - 20, view[3] + ((view[1] - to.height - 40) * 0.5)), 10);
			to.left = parseInt(Math.max(view[2] - 20, view[2] + ((view[0] - to.width - 40) * 0.5)), 10);

			return to;
		},

		_get_obj_pos = function(obj) {
			var pos = obj.offset();

			pos.top += parseInt( obj.css('paddingTop'), 10 ) || 0;
			pos.left += parseInt( obj.css('paddingLeft'), 10 ) || 0;

			pos.top += parseInt( obj.css('border-top-width'), 10 ) || 0;
			pos.left += parseInt( obj.css('border-left-width'), 10 ) || 0;

			pos.width = obj.width();
			pos.height = obj.height();

			return pos;
		},

		_get_zoom_from = function() {
			var orig = selectedOpts.orig ? $(selectedOpts.orig) : false,
				from = {},
				pos,
				view;

			if (orig && orig.length) {
				pos = _get_obj_pos(orig);

				from = {
					width : pos.width + (currentOpts.padding * 2),
					height : pos.height + (currentOpts.padding * 2),
					top	: pos.top - currentOpts.padding - 20,
					left : pos.left - currentOpts.padding - 20
				};

			} else {
				view = _get_viewport();

				from = {
					width : currentOpts.padding * 2,
					height : currentOpts.padding * 2,
					top	: parseInt(view[3] + view[1] * 0.5, 10),
					left : parseInt(view[2] + view[0] * 0.5, 10)
				};
			}

			return from;
		},

		_animate_loading = function() {
			if (!loading.is(':visible')){
				clearInterval(loadingTimer);
				return;
			}

			$('div', loading).css('top', (loadingFrame * -40) + 'px');

			loadingFrame = (loadingFrame + 1) % 12;
		};

	/*
	 * Public methods 
	 */

	$.fn.fancybox = function(options) {
		if (!$(this).length) {
			return this;
		}

		$(this)
			.data('fancybox', $.extend({}, options, ($.metadata ? $(this).metadata() : {})))
			.unbind('click.fb')
			.bind('click.fb', function(e) {
				e.preventDefault();

				if (busy) {
					return;
				}

				busy = true;

				$(this).blur();

				selectedArray = [];
				selectedIndex = 0;

				var rel = $(this).attr('rel') || '';

				if (!rel || rel == '' || rel === 'nofollow') {
					selectedArray.push(this);

				} else {
					selectedArray = $("a[rel=" + rel + "], area[rel=" + rel + "]");
					selectedIndex = selectedArray.index( this );
				}

				_start();

				return;
			});

		return this;
	};

	$.fancybox = function(obj) {
		var opts;

		if (busy) {
			return;
		}

		busy = true;
		opts = typeof arguments[1] !== 'undefined' ? arguments[1] : {};

		selectedArray = [];
		selectedIndex = parseInt(opts.index, 10) || 0;

		if ($.isArray(obj)) {
			for (var i = 0, j = obj.length; i < j; i++) {
				if (typeof obj[i] == 'object') {
					$(obj[i]).data('fancybox', $.extend({}, opts, obj[i]));
				} else {
					obj[i] = $({}).data('fancybox', $.extend({content : obj[i]}, opts));
				}
			}

			selectedArray = jQuery.merge(selectedArray, obj);

		} else {
			if (typeof obj == 'object') {
				$(obj).data('fancybox', $.extend({}, opts, obj));
			} else {
				obj = $({}).data('fancybox', $.extend({content : obj}, opts));
			}

			selectedArray.push(obj);
		}

		if (selectedIndex > selectedArray.length || selectedIndex < 0) {
			selectedIndex = 0;
		}

		_start();
	};

	$.fancybox.showActivity = function() {
		clearInterval(loadingTimer);

		loading.show();
		loadingTimer = setInterval(_animate_loading, 66);
	};

	$.fancybox.hideActivity = function() {
		loading.hide();
	};

	$.fancybox.next = function() {
		return $.fancybox.pos( currentIndex + 1);
	};

	$.fancybox.prev = function() {
		return $.fancybox.pos( currentIndex - 1);
	};

	$.fancybox.pos = function(pos) {
		if (busy) {
			return;
		}

		pos = parseInt(pos);

		selectedArray = currentArray;

		if (pos > -1 && pos < currentArray.length) {
			selectedIndex = pos;
			_start();

		} else if (currentOpts.cyclic && currentArray.length > 1) {
			selectedIndex = pos >= currentArray.length ? 0 : currentArray.length - 1;
			_start();
		}

		return;
	};

	$.fancybox.cancel = function() {
		if (busy) {
			return;
		}

		busy = true;

		$.event.trigger('fancybox-cancel');

		_abort();

		selectedOpts.onCancel(selectedArray, selectedIndex, selectedOpts);

		busy = false;
	};

	// Note: within an iframe use - parent.$.fancybox.close();
	$.fancybox.close = function() {
		if (busy || wrap.is(':hidden')) {
			return;
		}

		busy = true;

		if (currentOpts && false === currentOpts.onCleanup(currentArray, currentIndex, currentOpts)) {
			busy = false;
			return;
		}

		_abort();

		$(close.add( nav_left ).add( nav_right )).hide();

		$(content.add( overlay )).unbind();

		$(window).unbind("resize.fb scroll.fb");
		$(document).unbind('keydown.fb');

		content.find('iframe').attr('src', isIE6 && /^https/i.test(window.location.href || '') ? 'javascript:void(false)' : 'about:blank');

		if (currentOpts.titlePosition !== 'inside') {
			title.empty();
		}

		wrap.stop();

		function _cleanup() {
			overlay.fadeOut('fast');

			title.empty().hide();
			wrap.hide();

			$.event.trigger('fancybox-cleanup');

			content.empty();

			currentOpts.onClosed(currentArray, currentIndex, currentOpts);

			currentArray = selectedOpts	= [];
			currentIndex = selectedIndex = 0;
			currentOpts = selectedOpts	= {};

			busy = false;
		}

		if (currentOpts.transitionOut == 'elastic') {
			start_pos = _get_zoom_from();

			var pos = wrap.position();

			final_pos = {
				top	 : pos.top ,
				left : pos.left,
				width :	wrap.width(),
				height : wrap.height()
			};

			if (currentOpts.opacity) {
				final_pos.opacity = 1;
			}

			title.empty().hide();

			fx.prop = 1;

			$(fx).animate({ prop: 0 }, {
				 duration : currentOpts.speedOut,
				 easing : currentOpts.easingOut,
				 step : _draw,
				 complete : _cleanup
			});

		} else {
			wrap.fadeOut( currentOpts.transitionOut == 'none' ? 0 : currentOpts.speedOut, _cleanup);
		}
	};

	$.fancybox.resize = function() {
		if (overlay.is(':visible')) {
			overlay.css('height', $(document).height());
		}

		$.fancybox.center(true);
	};

	$.fancybox.center = function() {
		var view, align;

		if (busy) {
			return;	
		}

		align = arguments[0] === true ? 1 : 0;
		view = _get_viewport();

		if (!align && (wrap.width() > view[0] || wrap.height() > view[1])) {
			return;	
		}

		wrap
			.stop()
			.animate({
				'top' : parseInt(Math.max(view[3] - 20, view[3] + ((view[1] - content.height() - 40) * 0.5) - currentOpts.padding)),
				'left' : parseInt(Math.max(view[2] - 20, view[2] + ((view[0] - content.width() - 40) * 0.5) - currentOpts.padding))
			}, typeof arguments[0] == 'number' ? arguments[0] : 200);
	};

	$.fancybox.init = function() {
		if ($("#fancybox-wrap").length) {
			return;
		}

		$('body').append(
			tmp	= $('<div id="fancybox-tmp"></div>'),
			loading	= $('<div id="fancybox-loading"><div></div></div>'),
			overlay	= $('<div id="fancybox-overlay"></div>'),
			wrap = $('<div id="fancybox-wrap"></div>')
		);

		outer = $('<div id="fancybox-outer"></div>')
			.append('<div class="fancybox-bg" id="fancybox-bg-n"></div><div class="fancybox-bg" id="fancybox-bg-ne"></div><div class="fancybox-bg" id="fancybox-bg-e"></div><div class="fancybox-bg" id="fancybox-bg-se"></div><div class="fancybox-bg" id="fancybox-bg-s"></div><div class="fancybox-bg" id="fancybox-bg-sw"></div><div class="fancybox-bg" id="fancybox-bg-w"></div><div class="fancybox-bg" id="fancybox-bg-nw"></div>')
			.appendTo( wrap );

		outer.append(
			content = $('<div id="fancybox-content"></div>'),
			close = $('<a id="fancybox-close"></a>'),
			title = $('<div id="fancybox-title"></div>'),

			nav_left = $('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),
			nav_right = $('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>')
		);

		close.click($.fancybox.close);
		loading.click($.fancybox.cancel);

		nav_left.click(function(e) {
			e.preventDefault();
			$.fancybox.prev();
		});

		nav_right.click(function(e) {
			e.preventDefault();
			$.fancybox.next();
		});

		if ($.fn.mousewheel) {
			wrap.bind('mousewheel.fb', function(e, delta) {
				if (busy) {
					e.preventDefault();

				} else if ($(e.target).get(0).clientHeight == 0 || $(e.target).get(0).scrollHeight === $(e.target).get(0).clientHeight) {
					e.preventDefault();
					$.fancybox[ delta > 0 ? 'prev' : 'next']();
				}
			});
		}

		if (!$.support.opacity) {
			wrap.addClass('fancybox-ie');
		}

		if (isIE6) {
			loading.addClass('fancybox-ie6');
			wrap.addClass('fancybox-ie6');

			$('<iframe id="fancybox-hide-sel-frame" src="' + (/^https/i.test(window.location.href || '') ? 'javascript:void(false)' : 'about:blank' ) + '" scrolling="no" border="0" frameborder="0" tabindex="-1"></iframe>').prependTo(outer);
		}
	};

	$.fn.fancybox.defaults = {
		padding : 10,
		margin : 40,
		opacity : false,
		modal : false,
		cyclic : false,
		scrolling : 'auto',	// 'auto', 'yes' or 'no'

		width : 560,
		height : 340,

		autoScale : true,
		autoDimensions : true,
		centerOnScroll : false,

		ajax : {},
		swf : { wmode: 'transparent' },

		hideOnOverlayClick : true,
		hideOnContentClick : false,

		overlayShow : true,
		overlayOpacity : 0.7,
		overlayColor : '#777',

		titleShow : true,
		titlePosition : 'float', // 'float', 'outside', 'inside' or 'over'
		titleFormat : null,
		titleFromAlt : false,

		transitionIn : 'fade', // 'elastic', 'fade' or 'none'
		transitionOut : 'fade', // 'elastic', 'fade' or 'none'

		speedIn : 300,
		speedOut : 300,

		changeSpeed : 300,
		changeFade : 'fast',

		easingIn : 'swing',
		easingOut : 'swing',

		showCloseButton	 : true,
		showNavArrows : true,
		enableEscapeButton : true,
		enableKeyboardNav : true,

		onStart : function(){},
		onCancel : function(){},
		onComplete : function(){},
		onCleanup : function(){},
		onClosed : function(){},
		onError : function(){}
	};

	$(document).ready(function() {
		$.fancybox.init();
	});

})(jQuery);;

/*
 * Jeditable - jQuery in place edit plugin
 *
 * Copyright (c) 2006-2009 Mika Tuupola, Dylan Verheul
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Based on editable by Dylan Verheul <dylan_at_dyve.net>:
 *    http://www.dyve.net/jquery/?editable
 *
 */

/**
  * Version 1.7.2-dev
  *
  * ** means there is basic unit tests for this parameter. 
  *
  * @name  Jeditable
  * @type  jQuery
  * @param String  target             (POST) URL or function to send edited content to **
  * @param Hash    options            additional options 
  * @param String  options[method]    method to use to send edited content (POST or PUT) **
  * @param Function options[callback] Function to run after submitting edited content **
  * @param String  options[name]      POST parameter name of edited content
  * @param String  options[id]        POST parameter name of edited div id
  * @param Hash    options[submitdata] Extra parameters to send when submitting edited content.
  * @param String  options[type]      text, textarea or select (or any 3rd party input type) **
  * @param Integer options[rows]      number of rows if using textarea ** 
  * @param Integer options[cols]      number of columns if using textarea **
  * @param Mixed   options[height]    'auto', 'none' or height in pixels **
  * @param Mixed   options[width]     'auto', 'none' or width in pixels **
  * @param String  options[loadurl]   URL to fetch input content before editing **
  * @param String  options[loadtype]  Request type for load url. Should be GET or POST.
  * @param String  options[loadtext]  Text to display while loading external content.
  * @param Mixed   options[loaddata]  Extra parameters to pass when fetching content before editing.
  * @param Mixed   options[data]      Or content given as paramameter. String or function.**
  * @param String  options[indicator] indicator html to show when saving
  * @param String  options[tooltip]   optional tooltip text via title attribute **
  * @param String  options[event]     jQuery event such as 'click' of 'dblclick' **
  * @param String  options[submit]    submit button value, empty means no button **
  * @param String  options[cancel]    cancel button value, empty means no button **
  * @param String  options[cssclass]  CSS class to apply to input form. 'inherit' to copy from parent. **
  * @param String  options[style]     Style to apply to input form 'inherit' to copy from parent. **
  * @param String  options[select]    true or false, when true text is highlighted ??
  * @param String  options[placeholder] Placeholder text or html to insert when element is empty. **
  * @param String  options[onblur]    'cancel', 'submit', 'ignore' or function ??
  *             
  * @param Function options[onsubmit] function(settings, original) { ... } called before submit
  * @param Function options[onreset]  function(settings, original) { ... } called before reset
  * @param Function options[onerror]  function(settings, original, xhr) { ... } called on error
  *             
  * @param Hash    options[ajaxoptions]  jQuery Ajax options. See docs.jquery.com.
  *             
  */

(function($) {

    $.fn.editable = function(target, options) {
            
        if ('disable' == target) {
            $(this).data('disabled.editable', true);
            return;
        }
        if ('enable' == target) {
            $(this).data('disabled.editable', false);
            return;
        }
        if ('destroy' == target) {
            $(this)
                .unbind($(this).data('event.editable'))
                .removeData('disabled.editable')
                .removeData('event.editable');
            return;
        }
        
        var settings = $.extend({}, $.fn.editable.defaults, {target:target}, options);
        
        /* setup some functions */
        var plugin   = $.editable.types[settings.type].plugin || function() { };
        var submit   = $.editable.types[settings.type].submit || function() { };
        var buttons  = $.editable.types[settings.type].buttons 
                    || $.editable.types['defaults'].buttons;
        var content  = $.editable.types[settings.type].content 
                    || $.editable.types['defaults'].content;
        var element  = $.editable.types[settings.type].element 
                    || $.editable.types['defaults'].element;
        var reset    = $.editable.types[settings.type].reset 
                    || $.editable.types['defaults'].reset;
        var callback = settings.callback || function() { };
        var onedit   = settings.onedit   || function() { }; 
        var onsubmit = settings.onsubmit || function() { };
        var onreset  = settings.onreset  || function() { };
        var onerror  = settings.onerror  || reset;
          
        /* Show tooltip. */
        if (settings.tooltip) {
            $(this).attr('title', settings.tooltip);
        }
        
        settings.autowidth  = 'auto' == settings.width;
        settings.autoheight = 'auto' == settings.height;
        
        return this.each(function() {
                        
            /* Save this to self because this changes when scope changes. */
            var self = this;  
                   
            /* Inlined block elements lose their width and height after first edit. */
            /* Save them for later use as workaround. */
            var savedwidth  = $(self).width();
            var savedheight = $(self).height();

            /* Save so it can be later used by $.editable('destroy') */
            $(this).data('event.editable', settings.event);
            
            /* If element is empty add something clickable (if requested) */
            if (!$.trim($(this).html())) {
                $(this).html(settings.placeholder);
            }
            
            $(this).bind(settings.event, function(e) {
                
                /* Abort if element is disabled. */
                if (true === $(this).data('disabled.editable')) {
                    return;
                }
                
                /* Prevent throwing an exeption if edit field is clicked again. */
                if (self.editing) {
                    return;
                }
                
                /* Abort if onedit hook returns false. */
                if (false === onedit.apply(this, [settings, self])) {
                   return;
                }
                
                /* Prevent default action and bubbling. */
                e.preventDefault();
                e.stopPropagation();
                
                /* Remove tooltip. */
                if (settings.tooltip) {
                    $(self).removeAttr('title');
                }
                
                /* Figure out how wide and tall we are, saved width and height. */
                /* Workaround for http://dev.jquery.com/ticket/2190 */
                if (0 == $(self).width()) {
                    settings.width  = savedwidth;
                    settings.height = savedheight;
                } else {
                    if (settings.width != 'none') {
                        settings.width = 
                            settings.autowidth ? $(self).width()  : settings.width;
                    }
                    if (settings.height != 'none') {
                        settings.height = 
                            settings.autoheight ? $(self).height() : settings.height;
                    }
                }
                
                /* Remove placeholder text, replace is here because of IE. */
                if ($(this).html().toLowerCase().replace(/(;|"|\/)/g, '') == 
                    settings.placeholder.toLowerCase().replace(/(;|"|\/)/g, '')) {
                        $(this).html('');
                }
                                
                self.editing    = true;
                self.revert     = $(self).html();
                $(self).html('');

                /* Create the form object. */
                var form = $('<form />');
                
                /* Apply css or style or both. */
                if (settings.cssclass) {
                    if ('inherit' == settings.cssclass) {
                        form.attr('class', $(self).attr('class'));
                    } else {
                        form.attr('class', settings.cssclass);
                    }
                }

                if (settings.style) {
                    if ('inherit' == settings.style) {
                        form.attr('style', $(self).attr('style'));
                        /* IE needs the second line or display wont be inherited. */
                        form.css('display', $(self).css('display'));                
                    } else {
                        form.attr('style', settings.style);
                    }
                }

                /* Add main input element to form and store it in input. */
                var input = element.apply(form, [settings, self]);

                /* Set input content via POST, GET, given data or existing value. */
                var input_content;
                
                if (settings.loadurl) {
                    var t = setTimeout(function() {
                        input.disabled = true;
                        content.apply(form, [settings.loadtext, settings, self]);
                    }, 100);

                    var loaddata = {};
                    loaddata[settings.id] = self.id;
                    if ($.isFunction(settings.loaddata)) {
                        $.extend(loaddata, settings.loaddata.apply(self, [self.revert, settings]));
                    } else {
                        $.extend(loaddata, settings.loaddata);
                    }
                    $.ajax({
                       type : settings.loadtype,
                       url  : settings.loadurl,
                       data : loaddata,
                       async : false,
                       success: function(result) {
                          window.clearTimeout(t);
                          input_content = result;
                          input.disabled = false;
                       }
                    });
                } else if (settings.data) {
                    input_content = settings.data;
                    if ($.isFunction(settings.data)) {
                        input_content = settings.data.apply(self, [self.revert, settings]);
                    }
                } else {
                    input_content = self.revert; 
                }
                content.apply(form, [input_content, settings, self]);

                input.attr('name', settings.name);
        
                /* Add buttons to the form. */
                buttons.apply(form, [settings, self]);
         
                /* Add created form to self. */
                $(self).append(form);
         
                /* Attach 3rd party plugin if requested. */
                plugin.apply(form, [settings, self]);

                /* Focus to first visible form element. */
                $(':input:visible:enabled:first', form).focus();

                /* Highlight input contents when requested. */
                if (settings.select) {
                    input.select();
                }
        
                /* discard changes if pressing esc */
                input.keydown(function(e) {
                    if (e.keyCode == 27) {
                        e.preventDefault();
                        reset.apply(form, [settings, self]);
                    }
                });

                /* Discard, submit or nothing with changes when clicking outside. */
                /* Do nothing is usable when navigating with tab. */
                var t;
                if ('cancel' == settings.onblur) {
                    input.blur(function(e) {
                        /* Prevent canceling if submit was clicked. */
                        t = setTimeout(function() {
                            reset.apply(form, [settings, self]);
                        }, 500);
                    });
                } else if ('submit' == settings.onblur) {
                    input.blur(function(e) {
                        /* Prevent double submit if submit was clicked. */
                        t = setTimeout(function() {
                            form.submit();
                        }, 200);
                    });
                } else if ($.isFunction(settings.onblur)) {
                    input.blur(function(e) {
                        settings.onblur.apply(self, [input.val(), settings]);
                    });
                } else {
                    input.blur(function(e) {
                      /* TODO: maybe something here */
                    });
                }

                form.submit(function(e) {

                    if (t) { 
                        clearTimeout(t);
                    }

                    /* Do no submit. */
                    e.preventDefault(); 
            
                    /* Call before submit hook. */
                    /* If it returns false abort submitting. */                    
                    if (false !== onsubmit.apply(form, [settings, self])) { 
                        /* Custom inputs call before submit hook. */
                        /* If it returns false abort submitting. */
                        if (false !== submit.apply(form, [settings, self])) { 

                          /* Check if given target is function */
                          if ($.isFunction(settings.target)) {
                              var str = settings.target.apply(self, [input.val(), settings]);
                              $(self).html(str);
                              self.editing = false;
                              callback.apply(self, [self.innerHTML, settings]);
                              /* TODO: this is not dry */                              
                              if (!$.trim($(self).html())) {
                                  $(self).html(settings.placeholder);
                              }
                          } else {
                              /* Add edited content and id of edited element to POST. */
                              var submitdata = {};
                              submitdata[settings.name] = input.val();
                              submitdata[settings.id] = self.id;
                              /* Add extra data to be POST:ed. */
                              if ($.isFunction(settings.submitdata)) {
                                  $.extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
                              } else {
                                  $.extend(submitdata, settings.submitdata);
                              }

                              /* Quick and dirty PUT support. */
                              if ('PUT' == settings.method) {
                                  submitdata['_method'] = 'put';
                              }

                              /* Show the saving indicator. */
                              $(self).html(settings.indicator);
                              
                              /* Defaults for ajaxoptions. */
                              var ajaxoptions = {
                                  type    : 'POST',
                                  data    : submitdata,
                                  dataType: 'html',
                                  url     : settings.target,
                                  success : function(result, status) {
                                      if (ajaxoptions.dataType == 'html') {
                                        $(self).html(result);
                                      }
                                      self.editing = false;
                                      callback.apply(self, [result, settings]);
                                      if (!$.trim($(self).html())) {
                                          $(self).html(settings.placeholder);
                                      }
                                  },
                                  error   : function(xhr, status, error) {
                                      onerror.apply(form, [settings, self, xhr]);
                                  }
                              };
                              
                              /* Override with what is given in settings.ajaxoptions. */
                              $.extend(ajaxoptions, settings.ajaxoptions);   
                              $.ajax(ajaxoptions);          
                              
                            }
                        }
                    }
                    
                    /* Show tooltip again. */
                    $(self).attr('title', settings.tooltip);
                    
                    return false;
                });
            });
            
            /* Privileged methods */
            this.reset = function(form) {
                /* Prevent calling reset twice when blurring. */
                if (this.editing) {
                    /* Before reset hook, if it returns false abort reseting. */
                    if (false !== onreset.apply(form, [settings, self])) { 
                        $(self).html(self.revert);
                        self.editing   = false;
                        if (!$.trim($(self).html())) {
                            $(self).html(settings.placeholder);
                        }
                        /* Show tooltip again. */
                        if (settings.tooltip) {
                            $(self).attr('title', settings.tooltip);                
                        }
                    }                    
                }
            };            
        });

    };


    $.editable = {
        types: {
            defaults: {
                element : function(settings, original) {
                    var input = $('<input type="hidden"></input>');                
                    $(this).append(input);
                    return(input);
                },
                content : function(string, settings, original) {
                    $(':input:first', this).val(string);
                },
                reset : function(settings, original) {
                  original.reset(this);
                },
                buttons : function(settings, original) {
                    var form = this;
                    if (settings.submit) {
                        /* If given html string use that. */
                        if (settings.submit.match(/>$/)) {
                            var submit = $(settings.submit).click(function() {
                                if (submit.attr("type") != "submit") {
                                    form.submit();
                                }
                            });
                        /* Otherwise use button with given string as text. */
                        } else {
                            var submit = $('<button type="submit" />');
                            submit.html(settings.submit);                            
                        }
                        $(this).append(submit);
                    }
                    if (settings.cancel) {
                        /* If given html string use that. */
                        if (settings.cancel.match(/>$/)) {
                            var cancel = $(settings.cancel);
                        /* otherwise use button with given string as text */
                        } else {
                            var cancel = $('<button type="cancel" />');
                            cancel.html(settings.cancel);
                        }
                        $(this).append(cancel);

                        $(cancel).click(function(event) {
                            if ($.isFunction($.editable.types[settings.type].reset)) {
                                var reset = $.editable.types[settings.type].reset;                                                                
                            } else {
                                var reset = $.editable.types['defaults'].reset;                                
                            }
                            reset.apply(form, [settings, original]);
                            return false;
                        });
                    }
                }
            },
            text: {
                element : function(settings, original) {
                    var input = $('<input />');
                    if (settings.width  != 'none') { input.attr('width', settings.width);  }
                    if (settings.height != 'none') { input.attr('height', settings.height); }
                    /* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
                    //input[0].setAttribute('autocomplete','off');
                    input.attr('autocomplete','off');
                    $(this).append(input);
                    return(input);
                }
            },
            textarea: {
                element : function(settings, original) {
                    var textarea = $('<textarea />');
                    if (settings.rows) {
                        textarea.attr('rows', settings.rows);
                    } else if (settings.height != "none") {
                        textarea.height(settings.height);
                    }
                    if (settings.cols) {
                        textarea.attr('cols', settings.cols);
                    } else if (settings.width != "none") {
                        textarea.width(settings.width);
                    }
                    $(this).append(textarea);
                    return(textarea);
                }
            },
            select: {
               element : function(settings, original) {
                    var select = $('<select />');
                    $(this).append(select);
                    return(select);
                },
                content : function(data, settings, original) {
                    /* If it is string assume it is json. */
                    if (String == data.constructor) {      
                        eval ('var json = ' + data);
                    } else {
                    /* Otherwise assume it is a hash already. */
                        var json = data;
                    }
                    for (var key in json) {
                        if (!json.hasOwnProperty(key)) {
                            continue;
                        }
                        if ('selected' == key) {
                            continue;
                        } 
                        var option = $('<option />').val(key).append(json[key]);
                        $('select', this).append(option);    
                    }                    
                    /* Loop option again to set selected. IE needed this... */ 
                    $('select', this).children().each(function() {
                        if ($(this).val() == json['selected'] || 
                            $(this).text() == $.trim(original.revert)) {
                                $(this).attr('selected', 'selected');
                        }
                    });
                    /* Submit on change if no submit button defined. */
                    if (!settings.submit) {
                        var form = this;
                        $('select', this).change(function() {
                            form.submit();
                        });
                    }
                }
            }
        },

        /* Add new input type */
        addInputType: function(name, input) {
            $.editable.types[name] = input;
        }
    };

    /* Publicly accessible defaults. */
    $.fn.editable.defaults = {
        name       : 'value',
        id         : 'id',
        type       : 'text',
        width      : 'auto',
        height     : 'auto',
        event      : 'click.editable',
        onblur     : 'cancel',
        loadtype   : 'GET',
        loadtext   : 'Loading...',
        placeholder: 'Click to edit',
        loaddata   : {},
        submitdata : {},
        ajaxoptions: {}
    };

})(jQuery);
;

/*	
	Watermark plugin for jQuery
	Version: 3.1.3
	http://jquery-watermark.googlecode.com/

	Copyright (c) 2009-2011 Todd Northrop
	http://www.speednet.biz/
	
	March 22, 2011

	Requires:  jQuery 1.2.3+
	
	Dual licensed under the MIT or GPL Version 2 licenses.
	See mit-license.txt and gpl2-license.txt in the project root for details.
------------------------------------------------------*/

(function ($, window, undefined) {

var
	// String constants for data names
	dataFlag = "watermark",
	dataClass = "watermarkClass",
	dataFocus = "watermarkFocus",
	dataFormSubmit = "watermarkSubmit",
	dataMaxLen = "watermarkMaxLength",
	dataPassword = "watermarkPassword",
	dataText = "watermarkText",
	
	// Copy of native jQuery regex use to strip return characters from element value
	rreturn = /\r/g,

	// Includes only elements with watermark defined
	selWatermarkDefined = "input:data(" + dataFlag + "),textarea:data(" + dataFlag + ")",

	// Includes only elements capable of having watermark
	selWatermarkAble = "input:text,input:password,input[type=search],input:not([type]),textarea",
	
	// triggerFns:
	// Array of function names to look for in the global namespace.
	// Any such functions found will be hijacked to trigger a call to
	// hideAll() any time they are called.  The default value is the
	// ASP.NET function that validates the controls on the page
	// prior to a postback.
	// 
	// Am I missing other important trigger function(s) to look for?
	// Please leave me feedback:
	// http://code.google.com/p/jquery-watermark/issues/list
	triggerFns = [
		"Page_ClientValidate"
	],
	
	// Holds a value of true if a watermark was displayed since the last
	// hideAll() was executed. Avoids repeatedly calling hideAll().
	pageDirty = false,
	
	// Detects if the browser can handle native placeholders
	hasNativePlaceholder = ("placeholder" in document.createElement("input"));

// Best practice: this plugin adds only one method to the jQuery object.
// Also ensures that the watermark code is only added once.
$.watermark = $.watermark || {

	// Current version number of the plugin
	version: "3.1.3",
		
	runOnce: true,
	
	// Default options used when watermarks are instantiated.
	// Can be changed to affect the default behavior for all
	// new or updated watermarks.
	options: {
		
		// Default class name for all watermarks
		className: "watermark",
		
		// If true, plugin will detect and use native browser support for
		// watermarks, if available. (e.g., WebKit's placeholder attribute.)
		useNative: true,
		
		// If true, all watermarks will be hidden during the window's
		// beforeunload event. This is done mainly because WebKit
		// browsers remember the watermark text during navigation
		// and try to restore the watermark text after the user clicks
		// the Back button. We can avoid this by hiding the text before
		// the browser has a chance to save it. The regular unload event
		// was tried, but it seems the browser saves the text before
		// that event kicks off, because it didn't work.
		hideBeforeUnload: true
	},
	
	// Hide one or more watermarks by specifying any selector type
	// i.e., DOM element, string selector, jQuery matched set, etc.
	hide: function (selector) {
		$(selector).filter(selWatermarkDefined).each(
			function () {
				$.watermark._hide($(this));
			}
		);
	},
	
	// Internal use only.
	_hide: function ($input, focus) {
		var elem = $input[0],
			inputVal = (elem.value || "").replace(rreturn, ""),
			inputWm = $input.data(dataText) || "",
			maxLen = $input.data(dataMaxLen) || 0,
			className = $input.data(dataClass);
	
		if ((inputWm.length) && (inputVal == inputWm)) {
			elem.value = "";
			
			// Password type?
			if ($input.data(dataPassword)) {
				
				if (($input.attr("type") || "") === "text") {
					var $pwd = $input.data(dataPassword) || [], 
						$wrap = $input.parent() || [];
						
					if (($pwd.length) && ($wrap.length)) {
						$wrap[0].removeChild($input[0]); // Can't use jQuery methods, because they destroy data
						$wrap[0].appendChild($pwd[0]);
						$input = $pwd;
					}
				}
			}
			
			if (maxLen) {
				$input.attr("maxLength", maxLen);
				$input.removeData(dataMaxLen);
			}
		
			if (focus) {
				$input.attr("autocomplete", "off");  // Avoid NS_ERROR_XPC_JS_THREW_STRING error in Firefox
				
				window.setTimeout(
					function () {
						$input.select();  // Fix missing cursor in IE
					}
				, 1);
			}
		}
		
		className && $input.removeClass(className);
	},
	
	// Display one or more watermarks by specifying any selector type
	// i.e., DOM element, string selector, jQuery matched set, etc.
	// If conditions are not right for displaying a watermark, ensures that watermark is not shown.
	show: function (selector) {
		$(selector).filter(selWatermarkDefined).each(
			function () {
				$.watermark._show($(this));
			}
		);
	},
	
	// Internal use only.
	_show: function ($input) {
		var elem = $input[0],
			val = (elem.value || "").replace(rreturn, ""),
			text = $input.data(dataText) || "",
			type = $input.attr("type") || "",
			className = $input.data(dataClass);

		if (((val.length == 0) || (val == text)) && (!$input.data(dataFocus))) {
			pageDirty = true;
		
			// Password type?
			if ($input.data(dataPassword)) {
				
				if (type === "password") {
					var $pwd = $input.data(dataPassword) || [],
						$wrap = $input.parent() || [];
						
					if (($pwd.length) && ($wrap.length)) {
						$wrap[0].removeChild($input[0]); // Can't use jQuery methods, because they destroy data
						$wrap[0].appendChild($pwd[0]);
						$input = $pwd;
						$input.attr("maxLength", text.length);
						elem = $input[0];
					}
				}
			}
		
			// Ensure maxLength big enough to hold watermark (input of type="text" or type="search" only)
			if ((type === "text") || (type === "search")) {
				var maxLen = $input.attr("maxLength") || 0;
				
				if ((maxLen > 0) && (text.length > maxLen)) {
					$input.data(dataMaxLen, maxLen);
					$input.attr("maxLength", text.length);
				}
			}
            
			className && $input.addClass(className);
			elem.value = text;
		}
		else {
			$.watermark._hide($input);
		}
	},
	
	// Hides all watermarks on the current page.
	hideAll: function () {
		if (pageDirty) {
			$.watermark.hide(selWatermarkAble);
			pageDirty = false;
		}
	},
	
	// Displays all watermarks on the current page.
	showAll: function () {
		$.watermark.show(selWatermarkAble);
	}
};

$.fn.watermark = $.fn.watermark || function (text, options) {
	///	<summary>
	///		Set watermark text and class name on all input elements of type="text/password/search" and
	/// 	textareas within the matched set. If className is not specified in options, the default is
	/// 	"watermark". Within the matched set, only input elements with type="text/password/search"
	/// 	and textareas are affected; all other elements are ignored.
	///	</summary>
	///	<returns type="jQuery">
	///		Returns the original jQuery matched set (not just the input and texarea elements).
	/// </returns>
	///	<param name="text" type="String">
	///		Text to display as a watermark when the input or textarea element has an empty value and does not
	/// 	have focus. The first time watermark() is called on an element, if this argument is empty (or not
	/// 	a String type), then the watermark will have the net effect of only changing the class name when
	/// 	the input or textarea element's value is empty and it does not have focus.
	///	</param>
	///	<param name="options" type="Object" optional="true">
	///		Provides the ability to override the default watermark options ($.watermark.options). For backward
	/// 	compatibility, if a string value is supplied, it is used as the class name that overrides the class
	/// 	name in $.watermark.options.className. Properties include:
	/// 		className: When the watermark is visible, the element will be styled using this class name.
	/// 		useNative (Boolean or Function): Specifies if native browser support for watermarks will supersede
	/// 			plugin functionality. If useNative is a function, the return value from the function will
	/// 			determine if native support is used. The function is passed one argument -- a jQuery object
	/// 			containing the element being tested as the only element in its matched set -- and the DOM
	/// 			element being tested is the object on which the function is invoked (the value of "this").
	///	</param>
	/// <remarks>
	///		The effect of changing the text and class name on an input element is called a watermark because
	///		typically light gray text is used to provide a hint as to what type of input is required. However,
	///		the appearance of the watermark can be something completely different: simply change the CSS style
	///		pertaining to the supplied class name.
	///		
	///		The first time watermark() is called on an element, the watermark text and class name are initialized,
	///		and the focus and blur events are hooked in order to control the display of the watermark.  Also, as
	/// 	of version 3.0, drag and drop events are hooked to guard against dropped text being appended to the
	/// 	watermark.  If native watermark support is provided by the browser, it is detected and used, unless
	/// 	the useNative option is set to false.
	///		
	///		Subsequently, watermark() can be called again on an element in order to change the watermark text
	///		and/or class name, and it can also be called without any arguments in order to refresh the display.
	///		
	///		For example, after changing the value of the input or textarea element programmatically, watermark()
	/// 	should be called without any arguments to refresh the display, because the change event is only
	/// 	triggered by user actions, not by programmatic changes to an input or textarea element's value.
	/// 	
	/// 	The one exception to programmatic updates is for password input elements:  you are strongly cautioned
	/// 	against changing the value of a password input element programmatically (after the page loads).
	/// 	The reason is that some fairly hairy code is required behind the scenes to make the watermarks bypass
	/// 	IE security and switch back and forth between clear text (for watermarks) and obscured text (for
	/// 	passwords).  It is *possible* to make programmatic changes, but it must be done in a certain way, and
	/// 	overall it is not recommended.
	/// </remarks>
	
	if (!this.length) {
		return this;
	}
	
	var hasClass = false,
		hasText = (typeof(text) === "string");
	
	if (hasText) {
		text = text.replace(rreturn, "");
	}
	
	if (typeof(options) === "object") {
		hasClass = (typeof(options.className) === "string");
		options = $.extend({}, $.watermark.options, options);
	}
	else if (typeof(options) === "string") {
		hasClass = true;
		options = $.extend({}, $.watermark.options, {className: options});
	}
	else {
		options = $.watermark.options;
	}
	
	if (typeof(options.useNative) !== "function") {
		options.useNative = options.useNative? function () { return true; } : function () { return false; };
	}
	
	return this.each(
		function () {
			var $input = $(this);
			
			if (!$input.is(selWatermarkAble)) {
				return;
			}
			
			// Watermark already initialized?
			if ($input.data(dataFlag)) {
			
				// If re-defining text or class, first remove existing watermark, then make changes
				if (hasText || hasClass) {
					$.watermark._hide($input);
			
					if (hasText) {
						$input.data(dataText, text);
					}
					
					if (hasClass) {
						$input.data(dataClass, options.className);
					}
				}
			}
			else {
			
				// Detect and use native browser support, if enabled in options
				if (
					(hasNativePlaceholder)
					&& (options.useNative.call(this, $input))
					&& (($input.attr("tagName") || "") !== "TEXTAREA")
				) {
					// className is not set because current placeholder standard doesn't
					// have a separate class name property for placeholders (watermarks).
					if (hasText) {
						$input.attr("placeholder", text);
					}
					
					// Only set data flag for non-native watermarks
					// [purposely commented-out] -> $input.data(dataFlag, 1);
					return;
				}
				
				$input.data(dataText, hasText? text : "");
				$input.data(dataClass, options.className);
				$input.data(dataFlag, 1); // Flag indicates watermark was initialized
				
				// Special processing for password type
				if (($input.attr("type") || "") === "password") {
					var $wrap = $input.wrap("<span>").parent(),
						$wm = $($wrap.html().replace(/type=["']?password["']?/i, 'type="text"'));
					
					$wm.data(dataText, $input.data(dataText));
					$wm.data(dataClass, $input.data(dataClass));
					$wm.data(dataFlag, 1);
					$wm.attr("maxLength", text.length);
					
					$wm.focus(
						function () {
							$.watermark._hide($wm, true);
						}
					).bind("dragenter",
						function () {
							$.watermark._hide($wm);
						}
					).bind("dragend",
						function () {
							window.setTimeout(function () { $wm.blur(); }, 1);
						}
					);
					$input.blur(
						function () {
							$.watermark._show($input);
						}
					).bind("dragleave",
						function () {
							$.watermark._show($input);
						}
					);
					
					$wm.data(dataPassword, $input);
					$input.data(dataPassword, $wm);
				}
				else {
					
					$input.focus(
						function () {
							$input.data(dataFocus, 1);
							$.watermark._hide($input, true);
						}
					).blur(
						function () {
							$input.data(dataFocus, 0);
							$.watermark._show($input);
						}
					).bind("dragenter",
						function () {
							$.watermark._hide($input);
						}
					).bind("dragleave",
						function () {
							$.watermark._show($input);
						}
					).bind("dragend",
						function () {
							window.setTimeout(function () { $.watermark._show($input); }, 1);
						}
					).bind("drop",
						// Firefox makes this lovely function necessary because the dropped text
						// is merged with the watermark before the drop event is called.
						function (evt) {
							var elem = $input[0],
								dropText = evt.originalEvent.dataTransfer.getData("Text");
							
							if ((elem.value || "").replace(rreturn, "").replace(dropText, "") === $input.data(dataText)) {
								elem.value = dropText;
							}
							
							$input.focus();
						}
					);
				}
				
				// In order to reliably clear all watermarks before form submission,
				// we need to replace the form's submit function with our own
				// function.  Otherwise watermarks won't be cleared when the form
				// is submitted programmatically.
				if (this.form) {
					var form = this.form,
						$form = $(form);
					
					if (!$form.data(dataFormSubmit)) {
						$form.submit($.watermark.hideAll);
						
						// form.submit exists for all browsers except Google Chrome
						// (see "else" below for explanation)
						if (form.submit) {
							$form.data(dataFormSubmit, form.submit);
							
							form.submit = (function (f, $f) {
								return function () {
									var nativeSubmit = $f.data(dataFormSubmit);
									
									$.watermark.hideAll();
									
									if (nativeSubmit.apply) {
										nativeSubmit.apply(f, Array.prototype.slice.call(arguments));
									}
									else {
										nativeSubmit();
									}
								};
							})(form, $form);
						}
						else {
							$form.data(dataFormSubmit, 1);
							
							// This strangeness is due to the fact that Google Chrome's
							// form.submit function is not visible to JavaScript (identifies
							// as "undefined").  I had to invent a solution here because hours
							// of Googling (ironically) for an answer did not turn up anything
							// useful.  Within my own form.submit function I delete the form's
							// submit function, and then call the non-existent function --
							// which, in the world of Google Chrome, still exists.
							form.submit = (function (f) {
								return function () {
									$.watermark.hideAll();
									delete f.submit;
									f.submit();
								};
							})(form);
						}
					}
				}
			}
			
			$.watermark._show($input);
		}
	);
};

// The code included within the following if structure is guaranteed to only run once,
// even if the watermark script file is included multiple times in the page.
if ($.watermark.runOnce) {
	$.watermark.runOnce = false;

	$.extend($.expr[":"], {

		// Extends jQuery with a custom selector - ":data(...)"
		// :data(<name>)  Includes elements that have a specific name defined in the jQuery data
		// collection. (Only the existence of the name is checked; the value is ignored.)
		// A more sophisticated version of the :data() custom selector originally part of this plugin
		// was removed for compatibility with jQuery UI. The original code can be found in the SVN
		// source listing in the file, "jquery.data.js".
		data: function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		}
	});

	// Overloads the jQuery .val() function to return the underlying input value on
	// watermarked input elements.  When .val() is being used to set values, this
	// function ensures watermarks are properly set/removed after the values are set.
	// Uses self-executing function to override the default jQuery function.
	(function (valOld) {

		$.fn.val = function () {
			
			// Best practice: return immediately if empty matched set
			if ( !this.length ) {
				return arguments.length? this : undefined;
			}

			// If no args, then we're getting the value of the first element;
			// otherwise we're setting values for all elements in matched set
			if ( !arguments.length ) {

				// If element is watermarked, get the underlying value;
				// otherwise use native jQuery .val()
				if ( this.data(dataFlag) ) {
					var v = (this[0].value || "").replace(rreturn, "");
					return (v === (this.data(dataText) || ""))? "" : v;
				}
				else {
					return valOld.apply( this, arguments );
				}
			}
			else {
				valOld.apply( this, arguments );
				$.watermark.show(this);
				return this;
			}
		};

	})($.fn.val);
	
	// Hijack any functions found in the triggerFns list
	if (triggerFns.length) {

		// Wait until DOM is ready before searching
		$(function () {
			var i, name, fn;
		
			for (i=triggerFns.length-1; i>=0; i--) {
				name = triggerFns[i];
				fn = window[name];
				
				if (typeof(fn) === "function") {
					window[name] = (function (origFn) {
						return function () {
							$.watermark.hideAll();
							return origFn.apply(null, Array.prototype.slice.call(arguments));
						};
					})(fn);
				}
			}
		});
	}

	$(window).bind("beforeunload", function () {
		if ($.watermark.options.hideBeforeUnload) {
			$.watermark.hideAll();
		}
	});
}

})(jQuery, window);
;

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['assignment-edit'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<input class=\"span12\" type=\"text\" data=\"title\" placeholder=\"Assignment Title\"/>\n<textarea class=\"span12\" data=\"description\" placeholder=\"Assignment Description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n<br/>Due date: <input class=\"span3 due-date\">\n<br/><br/> \n<!--<dd class=\"span1\">Width:</dd><dt class=\"span4\"><input type=\"text\" data=\"width\"/></dt>-->\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-edit-buttons'], 'item-edit-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['assignment-list'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <li><a href=\"";
  stack1 = helpers.id || depth0.id
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n    ";
  return buffer;}

  buffer += "<h2>Assignments</h2>\n<ul>\n    ";
  stack1 = helpers.models || depth0.models
  stack2 = helpers.each
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</ul>\n\n<button class=\"add-button btn success\">Add assignment</button>";
  return buffer;});
templates['assignment-top'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h2>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2 >\n\n<div class=\"description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n\n<button class=\"item-button edit-button btn success\">Edit assignment details</button>";
  return buffer;});
templates['assignment'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"assignment-top\"></div>\n\n<hr/>\n\n<div class=\"assignment-page\"></div>";});
templates['content'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"content-inner\">\n     <h3 class='title'>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n     <br/>\n     <div class='sections row'></div>\n     \n         <select class=\"content-button add-section-type\">\n             <option value=\"freeform\">Freeform</option>\n             <option value=\"gallery\">Gallery</option>\n             <option value=\"\">Generic</option>\n         </select>\n         <button class=\"content-button add-button btn success\">Add section</button>\n     <div class=\"clearfix\"></div>\n</div> ";
  return buffer;});
templates['dialog-section-delete'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "the entire section entitled \"";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"";
  return buffer;}

function program3(depth0,data) {
  
  
  return "this entire section";}

  buffer += "Are you SURE you want to permanently delete ";
  stack1 = helpers.title || depth0.title
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "?\n";
  return buffer;});
templates['home'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h2>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2 >\n<br/>";
  return buffer;});
templates['item-buttons'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"item-button drag-button\"></div>\n<button class=\"item-button edit-button btn success\">Edit</button>\n<button class=\"item-button delete-button btn danger\">X</button>";});
templates['item-container'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class='item-inner'></div>";});
templates['item-edit-buttons'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div>\n    <button class=\"save btn success\" data-loading-text=\"Saving...\" data-complete-text=\"Saved\">Save</button>\n    <button class=\"cancel btn\">Cancel</button>\n</div>\n<div class=\"errors\"></div>\n";});
templates['item-edit'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this;


  buffer += "<div class=\"row span6\">\n    <dd class=\"span1\">Title:</dd><dt class=\"span4\"><input type=\"text\" data=\"title\"/></dt>\n    <dd class=\"span1\">Width:</dd><dt class=\"span4\"><input type=\"text\" data=\"width\"/></dt>\n    <dd class=\"span1\">Blah:</dd><dt class=\"span4\"><input type=\"text\" data=\"blah\"/></dt>\n    <dd class=\"span1\">More:</dd><dt class=\"span4\"><input type=\"text\" data=\"morestuff\"/></dt>\n</div>\n<br/>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-edit-buttons'], 'item-edit-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
templates['item-freeform-edit'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0;


  buffer += "<textarea class=\"ckeditor\">";
  stack1 = helpers.html || depth0.html
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "html", { hash: {} }); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</textarea>\n<br/>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-edit-buttons'], 'item-edit-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['item-freeform'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0;


  stack1 = helpers.html || depth0.html
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "html", { hash: {} }); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-buttons'], 'item-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
templates['item-gallery-edit'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this;


  buffer += "<input type=\"text\" data=\"title\" placeholder=\"Title\"/>\n<input type=\"text\" data=\"image_url\" placeholder=\"Image URL\"/>\n<input type=\"text\" data=\"thumb_url\" placeholder=\"Thumbnail URL\"/>\n<iframe class=\"uploader\"></iframe>\n<input type=\"text\" data=\"url\" placeholder=\"Link URL\"/>\n<textarea data=\"notes\" placeholder=\"Notes...\"/>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-edit-buttons'], 'item-edit-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['item-gallery-title'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + ": ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "(<a target=\"_blank\" href=\"";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">link</a>)";
  return buffer;}

  buffer += "<b>";
  stack1 = helpers.title || depth0.title
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "<span class=\"notes\">";
  stack1 = helpers.notes || depth0.notes
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "notes", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span></b> ";
  stack1 = helpers.url || depth0.url
  stack2 = helpers['if']
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['item-gallery'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var stack1;
  stack1 = helpers.thumb_url || depth0.thumb_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "thumb_url", { hash: {} }); }
  return escapeExpression(stack1);}

function program3(depth0,data) {
  
  var stack1;
  stack1 = helpers.image_url || depth0.image_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "image_url", { hash: {} }); }
  return escapeExpression(stack1);}

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " (<a target=\"_blank\" href=\"";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">link</a>)";
  return buffer;}

  buffer += "<h4 class='itemtitle'>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h4>\n<a href=\"";
  stack1 = helpers.image_url || depth0.image_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "image_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\" class=\"imagelink\" rel=\"gallery_";
  stack1 = helpers.parent || depth0.parent
  stack1 = stack1.id;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "parent.id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n    <img src=\"";
  stack1 = helpers.thumb_url || depth0.thumb_url
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" class=\"thumb\" />\n</a>\n<p class=\"notes\">";
  stack1 = helpers.notes || depth0.notes
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "notes", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.url || depth0.url
  stack2 = helpers['if']
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-buttons'], 'item-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['item-teacher-edit'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this;


  buffer += "<div class=\"row span6\">\n    <dd class=\"span1\">Name:</dd><dt class=\"span4\"><input type=\"text\" data=\"name\"/></dt>\n    <dd class=\"span1\">Title:</dd><dt class=\"span4\"><input type=\"text\" data=\"title\"/></dt>\n    <dd class=\"span1\">Email:</dd><dt class=\"span4\"><input type=\"text\" data=\"email\"/></dt>\n    <dd class=\"span1\">Phone:</dd><dt class=\"span4\"><input type=\"text\" data=\"phone\"/></dt>\n</div>\n<br/>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-edit-buttons'], 'item-edit-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['item-teacher'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<div>(";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + ")</div>";
  return buffer;}

  buffer += "<h4>";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h4>\n";
  stack1 = helpers.title || depth0.title
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<div>";
  stack1 = helpers.email || depth0.email
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "email", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n<div>";
  stack1 = helpers.phone || depth0.phone
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "phone", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-buttons'], 'item-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
templates['item'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h4 class='itemtitle'>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h4>\n<div class='attributes'></div>\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-buttons'], 'item-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
templates['lecture-edit'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<input class=\"span12\" type=\"text\" data=\"title\" placeholder=\"Lecture Title\"/>\n<textarea class=\"span12\" data=\"description\" placeholder=\"Lecture Description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n<br/>Scheduled date: <input class=\"span3 scheduled-date\">\n<br/><br/> \n<!--<dd class=\"span1\">Width:</dd><dt class=\"span4\"><input type=\"text\" data=\"width\"/></dt>-->\n";
  stack1 = depth0;
  stack1 = self.invokePartial(partials['item-edit-buttons'], 'item-edit-buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;});
templates['lecture-list'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <li><a href=\"";
  stack1 = helpers.id || depth0.id
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n    ";
  return buffer;}

  buffer += "<h2>Lectures</h2>\n<ul>\n    ";
  stack1 = helpers.models || depth0.models
  stack2 = helpers.each
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</ul>\n\n<button class=\"add-button btn success\">Add lecture</button>";
  return buffer;});
templates['lecture-top'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h2>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2 >\n\n<div class=\"description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n\n<button class=\"item-button edit-button btn success\">Edit lecture details</button>";
  return buffer;});
templates['lecture'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"lecture-top\"></div>\n\n<hr/>\n\n<div class=\"lecture-page\"></div>";});
templates['page-nav-row'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<a href=\"#\">";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>";
  return buffer;});
templates['page'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"contents\"></div>\n<div class=\"navigation\"><h4>Contents</h4><ul class=\"nav-links\"></ul><button class=\"page-button add-button btn success\">Add subpage</button></div>";});
templates['schedule-date'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<th><strong class=\"date\">";
  stack1 = helpers.date || depth0.date
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</strong></th>\n<td class=\"schedule-items\">\n    \n</td>";
  return buffer;});
templates['schedule-item'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h4 class=\"schedule-item\">\n    <span class=\"label type\">";
  stack1 = helpers.options || depth0.options
  stack1 = stack1.type;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "options.type", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\n    <a href=\"";
  stack1 = helpers.options || depth0.options
  stack1 = stack1.url;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "options.url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"title\">";
  stack1 = helpers.item || depth0.item
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "item.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>\n</h4>\n<div class=\"description\">";
  stack1 = helpers.item || depth0.item
  stack1 = stack1.description;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "item.description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>";
  return buffer;});
templates['schedule-section'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"span14\">\n    <table class=\"zebra-striped bordered-table schedule-inner\">\n    </table>\n</div>";});
templates['section'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"section-inner\">\n    <div class=\"section-button drag-button\"></div>\n    <h3 class='sectiontitle'>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n    <div class='items row'></div>\n    <button class=\"section-button add-button btn success\">Add item</button>\n    <button class=\"section-button delete-button btn danger\">X</button>\n</div>\n";
  return buffer;});
})()
;

Page = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'contents',
        relatedModel: 'Content',
        collectionType: 'ContentCollection',
        includeInJSON: ["_id", "title"],
        reverseRelation: {
            key: 'page',
            includeInJSON: false
        }
    }],
    urlRoot: '/api/page',
    initialize: function() {
        var self = this 
        //this.get('sections').url = function() { return self.url() + "/sections" }
    },
    saved: function() {
        console.log("page saved")        
    }
})

PageCollection = Backbone.Collection.extend({
    model: Page,
    initialize: function() {
        //console.log("sectioncollection created", this)   
    }    
});

Content = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'sections',
        relatedModel: 'Section',
        collectionType: 'SectionCollection',
        includeInJSON: '_id',
        reverseRelation: {
            key: 'parent',
            includeInJSON: false
        }
    }],
    urlRoot: '/api/content',
    initialize: function() {
        var self = this 
        this.get('sections').url = function() { return self.url() + "/sections" }
    },
    // parse: function(data) {
        // $("#jsoncode").html(JSON.stringify(data))
        // return data
    // }
})

ContentCollection = Backbone.Collection.extend({
    model: Content,
    initialize: function() {
        //console.log("sectioncollection created", this)   
    }    
});

Section = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'items',
        relatedModel: 'Item',
        collectionType: 'ItemCollection',
        includeInJSON: "_id",
        reverseRelation: {
            key: 'parent',
            includeInJSON: false
        },
    }],
    defaults: {width: 16},
    initialize: function() { 
        // this is a hack to force "items" to be a collection rather than an empty list
        if (this.get('items').length==0)
            this.set({items: [,]})
        var self = this 
        this.get('items').url = function() { return self.url() + "/items" }
    }
})

SectionCollection = Backbone.Collection.extend({
    model: Section,
    initialize: function() {
        //console.log("sectioncollection created", this)   
    }    
});

Item = Backbone.RelationalModel.extend({
    initialize: function() {
        //console.log("item created", this)   
    },
    defaults: {width: 4}
})

ItemCollection = Backbone.Collection.extend({
    model: Item,
    initialize: function() {
        //console.log("itemcollection created", this)   
    } 
});

Course = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'lectures',
        relatedModel: 'Lecture',
        collectionType: 'LectureCollection',
        includeInJSON: ["_id", "title", "description", "scheduled", "page"],
        reverseRelation: {
            key: 'course',
            includeInJSON: "_id"
        }
    }, {
        type: Backbone.HasMany,
        key: 'assignments',
        relatedModel: 'Assignment',
        collectionType: 'AssignmentCollection',
        includeInJSON: ["_id", "title", "description", "due", "page"],
        reverseRelation: {
            key: 'course',
            includeInJSON: "_id"
        }
    }, {
        type: Backbone.HasOne,
        key: 'content',
        relatedModel: 'Content',
        includeInJSON: "_id",
        reverseRelation: {
            key: 'course',
            includeInJSON: "_id",
            type: Backbone.HasOne
        }
    }],
    urlRoot: '/api/course',
    initialize: function() {
        var self = this
        // this.bind("change:content", function() {
            // self.fetchRelated("content")
        // })
        // this.bind("add:lectures", function() {
            // alert("lecture added")
        // })        
        // this.bind("add:assignments", function() {
            // alert("assignment added")
        // })
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})
;

Lecture = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasOne,
        key: 'page',
        relatedModel: 'Page',
        includeInJSON: "_id",
        // reverseRelation: { // TODO: this was commented out because it BREAKS EVERYTHING FOR NO REASON... grr
            // key: 'parent',
            // includeInJSON: false,
            // type: Backbone.HasOne
        // }
    }],
    urlRoot: '/api/lecture',
    defaults: {
        page: {}
    },
    initialize: function() {
        var self = this
        //this.get("page").bind('save', this.save, this)
        //this.get("page").url = function() { return self.url() + "/page" }
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

LectureCollection = Backbone.Collection.extend({
    model: Lecture,
    initialize: function() {
        
    }    
});

Assignment = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasOne,
        key: 'page',
        relatedModel: 'Page',
        includeInJSON: "_id",
        // reverseRelation: {
            // key: 'parent',
            // includeInJSON: false,
            // type: Backbone.HasOne
        // }
    }],
    urlRoot: '/api/assignment',
    defaults: {
        page: {}
    },
    initialize: function() {
        var self = this
        //this.get("page").bind('save', this.save, this)
        //this.get("page").url = function() { return self.url() + "/page" }
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

AssignmentCollection = Backbone.Collection.extend({
    model: Assignment,
    initialize: function() {
        
    }    
});

ItemView = Backbone.View.extend({
    tagName: "span",
    className: "item",
    render: function() {
        this.renderTemplate({target: ".item-inner"})
        var self = this
        _.each(_.keys(this.model.attributes), function(attr) {
            if (attr!="title" && attr!="_id" && attr!="parent" && attr!="width" && self.model.get(attr))
                self.$('.attributes').append("<div class='attr_" + attr + "'><b>" + attr + ":</b> " + self.model.get(attr) + "</div>")
        })
        this.updateWidth()
        return this
    },
    events: function() {
        return {
            "click .edit-button": "edit",
            "click .delete-button": "delete",
            "mouseenter .item-inner": "showActionButtons",
            "mouseleave .item-inner": "hideActionButtons"
        }
    },
    initialize: function() {
        this.el = $(this.el)
        this.type = this.type || this.options.type || ""
        if (this.type)
            this.template = "item-" + this.type
        else
            this.template = "item"
        this.el.addClass(this.template)
        this.model.bind('change', this.change, this)
        this.renderTemplate({template: "item-container"})
        this.change()
    },
    showActionButtons: function() {
        if (this.model.editing) return
        this.$(".item-button").not(".drag-button").fadeIn(50)
        this.$(".item-button.drag-button").fadeIn(200)
    },
    hideActionButtons: function() {
        this.$(".item-button").fadeOut(50)
    },
    edit: function() {
        this.model.editing = true
        this.editView = new ItemEditViews[this.type]({model: this.model, parent: this}).render()
        this.hideActionButtons()
    },
    "delete": function() {
        this.model.destroy()
    },
    close: function() {
        this.remove()
        this.unbind()
        this.model.unbind('change', this.render)
    },
    change: function() {
        this.render()
        this.el.attr('id', this.model.id || this.model.cid)
    }
})

ItemEditView = Backbone.View.extend({
    render: function() {
        Backbone.ModelBinding.bind(this)
        //this.focusFirstInput()
        return this
    },
    events: function() {
        return {
            "click .save": "save",
            "click .cancel": "cancel",
            "change input": "change"
        }
    },
    initialize: function() {
        this.el = $(this.el)
        this.type = this.type || this.options.type || this.options.parent.type || ""
        if (this.type)
            this.template = "item-" + this.type + "-edit"
        else
            this.template = "item-edit"
        this.el.addClass(this.template)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        this.render()
    },
    focusFirstInput: function() {
        var self = this
        _.defer(function() { self.$("input:first").focus() })
    },
    save: function() {
        var self = this
        self.$("input").blur()
        self.$('.save.btn').button('loading')
        this.model.save({}, {
            success: function() {
                self.$('.save.btn').button('complete')
                self.saved()
            },
            error: function(model, err) {
                var msg = "An unknown error occurred while saving. Please try again."
                switch(err.status) {
                    case 0:
                        msg = "Unable to connect; please check internet connectivity and then try again."
                        break
                    case 404:
                        msg = "The object could not be found on the server; it may have been deleted."
                        break
                }
                self.$('.errors').text(msg)
                self.$('.save.btn').button('complete')
            }
        })
    },
    saved: function() {
        
    },
    cancel: function() {
        this.memento.restore()
        this.close()
        if (!this.model.id) this.model.destroy()
    },
    change: function(ev) {
        
    },
    close: function() {
        this.model.editing = false
        this.remove()
        this.unbind()
        Backbone.ModelBinding.unbind(this)
        delete this.options.parent.editView
        this.options.parent.updateWidth()
    }
})

ItemEditPopupView = ItemEditView.extend({
    base: ItemEditView.prototype,
    className: "item-edit item-edit-popup",
    render: function() {
        this.renderTemplate()
        this.base.render.apply(this, arguments)
        return this
    },
    events: function() {
        return _.extend({
            "focus input": "scrollToShow",
            "keyup input": "keyup",
            "mouseenter": "bringToTop"
        }, this.base.events())
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
        this.reposition()
        this.scrollToShow()
        Dispatcher.bind("resized", this.reposition, this)
        $("body").append(this.el)
    },
    close: function() {
        this.base.close.apply(this, arguments)
        Dispatcher.unbind("resized", this.reposition, this)
    },
    change: function() {
        this.base.change.apply(this, arguments)
        this.reposition()
    },
    keyup: function(ev) {
        $(ev.target).change()
        if (ev.which==13) this.save()
        if (ev.which==27) this.cancel()
    },
    bringToTop: function() {
        $(".item-edit-popup").css("z-index", 50)
        this.el.css("z-index", 100)
    },
    saved: function() {
        var self = this
        self.el.animate({opacity: 0}, 300, function() { self.close() })
    },
    reposition: function(duration) {
        var self = this
        if (duration===undefined) duration = 0
        var parent = this.options.parent
        var pos = parent.el.offset()
        var top = pos.top + parent.el.height()
        var left = pos.left
        this.el.stop().animate({left: left, top: top}, duration, "swing", function () {
            if (self.$("input:focus").length > 0)
                self.scrollToShow()
        })
    },
    scrollToShow: function() {
        var self = this
        $("html, body").stop()
        _.defer(function() {
            var target_scroll_offset = $("body").scrollTop()
            if ($(window).height() + $("body").scrollTop() < $(self.el).offset().top + $(self.el).height() + 30)
                target_scroll_offset = $(self.el).offset().top + $(self.el).height() - $(window).height() + 30
            if ($("body").scrollTop() > $(self.el).offset().top)
                target_scroll_offset = $(self.el).offset().top
            if (target_scroll_offset > 0 && target_scroll_offset != $("body").scrollTop())
                $("html, body").stop().animate({scrollTop: target_scroll_offset}, 400)
        })
    }
})

ItemEditInlineView = ItemEditView.extend({
    base: ItemEditView.prototype,
    className: "item-edit item-edit-inline",
    minwidth: 6,
    render: function() {
        this.renderTemplate()
        this.base.render.apply(this, arguments)
        var self = this
        _.defer(function() { self.options.parent.updateWidth() }, 200)
        return this
    },
    events: function() {
        return _.extend({
            "keyup input": "keyup"
        }, this.base.events())
    },
    keyup: function(ev) {
        if (ev.which==13) this.save()
        if (ev.which==27) this.cancel()
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
        this.options.parent.$(".item-inner").hide()
        this.options.parent.el.append(this.el)
    },
    saved: function() {
        this.close()
    },
    close: function() {
        this.base.close.apply(this, arguments)
        this.options.parent.$(".item-inner").show()
    }    
})

ItemViews = {"": ItemView}
ItemEditViews = {"": ItemEditPopupView}

;

ItemViews["teacher"] = ItemView.extend({
    base: ItemView.prototype,
    template: "item-teacher",
    render: function() {
        this.renderTemplate()
        this.updateWidth()
        return this
    },
    events: function() {
        return _.extend({
            //"dblclick": "dblclick"
        }, this.base.events)
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
    },
    close: function() {
        this.base.close.apply(this, arguments)
    }
})

ItemEditViews["teacher"] = ItemEditPopupView.extend({
    base: ItemEditPopupView.prototype,
    template: "item-teacher-edit",
    render: function() {
        this.base.render.apply(this, arguments)
        return this
    },
    events: function() {
        return _.extend({
            //"dblclick": "dblclick"
        }, this.base.events)
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
    },
    close: function() {
        this.base.close.apply(this, arguments)
    }
})
;

(function() {

    var type = "gallery"
    
    ItemViews[type] = ItemView.extend({
        base: ItemView.prototype,
        render: function() {
            var self = this
            this.base.render.apply(this, arguments)
            this.$(".imagelink").fancybox({ // TODO: can trim down the CSS and remove images
                cyclic: true,
                hideOnContentClick: true,
                overlayOpacity: 0.2,
                showCloseButton: false,
                title: this.renderTemplate({template: "item-gallery-title", target: null}),
                titlePosition: 'over',
                onComplete: function() {
                    $("#fancybox-wrap").mousemove(function() { // TODO: more efficient, but still hides by default?
                        $("#fancybox-title").fadeIn(200)
                    })
                    $("#fancybox-wrap").mouseleave(function() {
                        $("#fancybox-title").stop().fadeOut(200)
                    })
                    $("#fancybox-title").hide()
                }
            })
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, this.base.events())
        },
        initialize: function() {
            this.model.attributes.width = 4
            this.base.initialize.apply(this, arguments)
        },
        close: function() {
            this.base.close.apply(this, arguments)
        }
    })
    
    var baseview = ItemEditInlineView 
    
    ItemEditViews[type] = baseview.extend({
        minwidth: 4,
        render: function() {
            baseview.prototype.render.apply(this, arguments)
            this.enablePlaceholders()
            var self = this
            this.$("iframe.uploader").load(function() {
	            var response_text = $("body", $("iframe").contents()).text()
	            var response_json = response_text ? JSON.parse(response_text) : {}
				if (response_json.image) {
					self.loadDownloadFrame("Success!")
					$("input[data=image_url]").val(response_json.image.url).change()
					if (response_json.thumb) $("input[data=thumb_url]").val(response_json.thumb.url).change()
				} else if (response_json._error) {
					self.loadDownloadFrame("Error!")
				}
	        })
            this.loadDownloadFrame()
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, baseview.prototype.events())
        },
        initialize: function() {
            baseview.prototype.initialize.apply(this, arguments)
        },
        loadDownloadFrame: function(message) {
        	// TODO: fetch a live policy and use it here
        	var policy = "eyJleHBpcmF0aW9uIjoiMjAxMi0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJ0aGlzY291cnNlIn0sWyJzdGFydHMtd2l0aCIsIiRrZXkiLCJ1cGxvYWRzLyJdLHsiYWNsIjoicHVibGljLXJlYWQifSxbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwwLDEwNDg1NzZdLFsic3RhcnRzLXdpdGgiLCIkbmFtZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIkRmlsZW5hbWUiLCIiXSxbInN0YXJ0cy13aXRoIiwiJHN1Y2Nlc3NfYWN0aW9uX3N0YXR1cyIsIiJdXX0="
        	var signature = "5I6tyYvu7M58QxizUXrf/3O1DPs="
        	var url = "https://thiscourse.s3.amazonaws.com/uploader/imageupload.html#policy:" + policy + ",signature:" + signature
        	if (message) url += ",message:" + message
        	this.$("iframe.uploader").attr("src", url)
        },
        close: function() {
            baseview.prototype.close.apply(this, arguments)
        }
    })

})()
;

(function() {

    var type = "freeform"
    
    ItemViews[type] = ItemView.extend({
        base: ItemView.prototype,
        render: function() {
            var self = this
            this.base.render.apply(this, arguments)
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, this.base.events())
        },
        initialize: function() {
            this.model.attributes.width = this.model.get('parent').get('width')
            this.base.initialize.apply(this, arguments)
        },
        close: function() {
            this.base.close.apply(this, arguments)
        }
    })
    
    var baseview = ItemEditInlineView 
    
    ItemEditViews[type] = baseview.extend({
        minwidth: 12,
        render: function() {
            //baseview.prototype.render.apply(this, arguments)
            var self = this
            this.renderTemplate()
            setTimeout(function() {
                $(".ckeditor", self.options.parent.el).ckeditor(ckeditor_config)
            }, 200) // TODO: why does this need to be delayed?
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, baseview.prototype.events())
        },
        initialize: function() {
            baseview.prototype.initialize.apply(this, arguments)
        },
        save: function() {
            this.model.set({html: this.$(".ckeditor").val()})
            baseview.prototype.save.apply(this, arguments)
        },
        close: function() {
            this.$(".ckeditor").ckeditorGet().destroy()
            baseview.prototype.close.apply(this, arguments)
        }
    })

})()
;

PageView = Backbone.View.extend({
    tagName: "div",
    className: "page",
    template: "page",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        //"click .page-button.add-button": "addNewContent"
    },
    showActionButtons: function() {
        this.$(".page-button").show()
    },
    hideActionButtons: function() {
        this.$(".page-button").hide()
        return false // to stop the propagation so that it won't trigger the parent's
    },
    render: function() {
        var self = this
        this.renderTemplate()
        this.makeSortable()
        this.update()
        this.$(".page-button.add-button").click(function() { self.addNewContent() })
        return this
    },
    button: function() {
        alert("button")
    },
    initialize: function() {
        this.pageNavRowViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:contents", this.updateContents, this)
        this.model.bind("add:contents", this.addContents, this)
        this.model.bind("remove:contents", this.removeContents, this)
        this.render()
    },
    addNewContent: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(val) {
            var new_content = new Content({title: val, width: 12})
            self.model.get('contents').add(new_content)
            self.pageNavRowViews[new_content.cid].showContent()
            new_content.save().success(function() { self.model.save() }) 
        })
    },    
    updateContents: function(model, coll) {
        //alert('update contents')
    },
    addContents: function(model, coll) {
        this.pageNavRowViews[model.cid] = new PageNavRowView({model: model, parent: this})
        this.$('.nav-links').append(this.pageNavRowViews[model.cid].el)
        if (!this.activeSubpage)
            this.pageNavRowViews[model.cid].showContent()
    },
    removeContents: function(model, coll) {
        if (!this.pageNavRowViews[model.cid]) return
        $(this.pageNavRowViews[model.cid].el).remove() //fadeOut(300, function() { $(this).remove() })
        delete this.pageNavRowViews[model.cid]
    },
    makeSortable: function() {
        var self = this
        this.$('.navigation ul').sortable({
            update: function(event, ui) {
                // get the post-sort section order (as a list of id's) and save the new collection order 
                var new_order = self.$('.navigation ul').sortable("toArray")
                self.model.get('contents').reorder(new_order)
                self.model.save()
            },
            opacity: 0.6,
            tolerance: "pointer",
            distance: 5
        })
    },
    update: function() {
        
    }
})


PageNavRowView = Backbone.View.extend({
    tagName: "li",
    template: "page-nav-row",
    events: {
        "click a": "showContent"
    },
    render: function() {
        this.renderTemplate()
        return this
    },
    initialize: function() {
        this.contentViews = {}
        this.el = $(this.el)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.el.attr('id', this.model.id)
        this.render()
    },
    showContent: function() {
        var self = this
        if (!this.contentView) {
            if (this.model.id)
                this.model.fetch()
            this.contentView = new ContentView({model: this.model})
            this.options.parent.$(".contents").append(this.contentView.render().el)
        }
        _.each(this.options.parent.pageNavRowViews, function(view) {
            // set each nav list item to active (bold) or not, appropriately
            view.el.toggleClass("active", view===self)
            if (view.contentView) // hide or show each content block appropriately
                view.contentView.el.toggle(view===self)
        })
        this.options.parent.activeSubpage = this
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    saved: function() {
        // save the parent too (so it stores the title), but only if the title has changed
        if (this.titleChanged) {
            this.saveParent()
            delete this.titleChanged
        }        
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    },
    saveParent: function() {
        //alert('saving parent')
        this.model.get('page').save()
    },
    close: function() {
        this.model.unbind('change', this.update, this)
        this.model.unbind("update:contents", this.updateContents, this)
        this.model.unbind("add:contents", this.addContents, this)
        this.model.unbind("remove:contents", this.removeContents, this)
    }
})

;

ContentView = Backbone.View.extend({
    tagName: "div",
    className: "content",
    template: "content",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        "click .content-button.add-button": "addNewSection", 
    },
    showActionButtons: function() {
        this.$(".content-button").show()
    },
    hideActionButtons: function() {
        this.$(".content-button").hide()
        return false // to stop the propagation so that it won't trigger the parent's
    },
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        this.makeEditable()
        return this
    },
    initialize: function() {
        this.sectionViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:sections", this.updateSections, this)
        this.model.bind("add:sections", this.addSections, this)
        this.model.bind("remove:sections", this.removeSections, this)
        this.model.bind('save', this.saved, this)
        this.render()
    },
    addNewSection: function() {
        var new_section = {type: this.$(".add-section-type").val()}
        if (this.model.get("width"))
            new_section.width = this.model.get("width") 
        this.model.get('sections').create(new_section)
    },    
    updateSections: function(model, coll) {
        //alert('update sections')
    },
    addSections: function(model, coll) {
        this.sectionViews[model.cid] = new SectionView({model: model})
        this.$('.sections').append(this.sectionViews[model.cid].el)
    },
    removeSections: function(model, coll) {
        if (!this.sectionViews[model.cid] || !this.sectionViews[model.cid].el) return
        $(this.sectionViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.sectionViews[model.cid]
    },
    makeEditable: function() {
        var self = this
        this.$(".title").editable(function(new_value) {
            self.model.set({title: new_value}).save()
        }, {
            submit: "Save",
            cancel: "Cancel",
            event: "dblclick",
            cssclass: "jeditable",
            tooltip: "Double click to edit",
            onedit: function() {
                _.defer(function() { self.$(".jeditable button").addClass("btn").css("margin-left", 5) })
            }
        })
    },
    makeSortable: function() {
        var self = this
        this.$('.sections').sortable({
            update: function(event, ui) {
                // get the post-sort section order (as a list of id's) and save the new collection order 
                var new_order = self.$('.sections').sortable("toArray")
                self.model.get('sections').reorder(new_order)
                self.model.save()
            },
            opacity: 0.6,
            tolerance: "pointer",
            handle: ".drag-button"
        })
    },
    update: function() {
        this.$('.title').text(this.model.get("title"))
    },
    saved: function() {
        console.log("content saved")        
    }
})
;

SectionView = Backbone.View.extend({
    tagName: "div",
    className: "section border2",
    template: "section",
    buttonFadeSpeed: 60,
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        return this
    },
    events: {
        "mouseenter .section-inner": "showBottomActionButtons",
        "mouseleave .section-inner": "hideAllActionButtons",
        "mouseenter .sectiontitle": "showTopActionButtons",
        "mouseout .sectiontitle": "hideTopActionButtons",
        "mouseenter .items": "hideTopActionButtons",
        "click .section-button.add-button": "addNewItem",
        "click .section-button.delete-button": "delete"
    },
    showBottomActionButtons: function() {
        this.$(".section-button.add-button").fadeIn(this.buttonFadeSpeed)
    },
    hideBottomActionButtons: function() {
        this.$(".section-button.add-button").fadeOut(this.buttonFadeSpeed)
        //return false // to stop the propagation so that it won't trigger the parent's
    },
    showTopActionButtons: function() {
        this.$(".section-button.drag-button").fadeIn(this.buttonFadeSpeed)
        this.$(".section-button.delete-button").fadeIn(this.buttonFadeSpeed)
    },
    hideTopActionButtons: function() {
        this.$(".section-button.drag-button").fadeOut(this.buttonFadeSpeed)
        this.$(".section-button.delete-button").fadeOut(this.buttonFadeSpeed)
        //return false // to stop the propagation so that it won't trigger the parent's
    },
    hideAllActionButtons: function() {
        this.$(".section-button").fadeOut(this.buttonFadeSpeed)
        //return false // to stop the propagation so that it won't trigger the parent's
    },
    initialize: function() {
        this.itemViews = {}
        this.el = $(this.el)
        this.el.attr('id', this.model.id)
        this.model.bind("change", this.update, this)
        this.model.bind("update:items", this.updateItems, this)
        this.model.bind("add:items", this.addItems, this)
        this.model.bind("remove:items", this.removeItems, this)
        this.model.bind("change:width", this.updateWidth, this)
        this.updateWidth()
        this.render()
        for (var i=0; i < this.model.get('items').length; i++)
            this.addItems(this.model.get('items').at(i), this.collection)
    },
    makeSortable: function() {
        var self = this
        this.$('.items').sortable({
            update: function(event, ui) {
                // get the post-sort item order (as a list of id's) and save the new collection order 
                var new_order = self.$('.items').sortable("toArray")
                self.model.get('items').reorder(new_order)
                self.model.save()
            },
            opacity: 0.6,
            tolerance: "pointer",
            handle: ".drag-button"
        })
    },
    addNewItem: _.throttle(function() {
        this.model.get('items').add({})
    }, 500),
    edit: function() {
        alert('editing! ' + this.model.attributes)
    },
    "delete": function() {
        var self = this
        if (this.model.get("items").length)
            delete_section_confirmation(this.model, function() { self.model.destroy() })
        else
            self.model.destroy()
    },
    updateItems: function(model, coll) {
        //alert('update items')
    },
    addItems: function(model, coll) {
        var type = model.get('type') || this.model.get('type') || ""
        var view = this.itemViews[model.cid] = new ItemViews[type]({model: model, type: type})
        this.$(".items").append(view.el)
        // if this is a new (unsaved) item, put it directly into edit mode
        if (!model.get("_id")) view.edit()
    },
    removeItems: function(model, coll) {
        if (!this.itemViews[model.cid].el) return
        $(this.itemViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.itemViews[model.cid]
    },
    update: function() {
        this.$('.sectiontitle').text(this.model.get("title"))
    }
})
;

LectureView = Backbone.View.extend({
    tagName: "div",
    className: "lecture",
    template: "lecture",
    render: function() {
        this.renderTemplate()
        this.renderTopView()
        this.renderPageView()
        return this
    },
    renderTopView: function() {
        this.$(".lecture-top").html("").append(this.topView.render().el)
    },
    renderPageView: function() {
        this.$(".lecture-page").html("").append(this.pageView.render().el)
    },
    events: {
        "click .lecture-top .edit-button": "edit"
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:page', this.pageChanged, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.topView = new LectureTopView({model: this.model})
        this.pageView = new PageView({model: this.model.get("page")})
        this.model.get("page").fetch()
        this.render()
    },
    pageChanged: function() {
        console.log("page changed")
        
    },
    close: function() {
        this.el.remove()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    edit: function(){
        this.topEditView = new LectureTopEditView({model: this.model, parent: this})
        this.$(".lecture-top").html("").append(this.topEditView.render().el)
    },
    saved: function() {
        // save the parent too (so it stores the title), but only if the title has changed
        console.log("lecture saved")
        if (this.titleChanged) {
            this.saveParent()
            delete this.titleChanged
        }        
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    },
    saveParent: function() {
        //alert('saving parent')
        this.model.get('page').save()
    }
})

LectureTopView = Backbone.View.extend({
    tagName: "div",
    className: "lecture-top",
    template: "lecture-top",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
    },
    render: function() {
        this.renderTemplate()
        //this.pageView.render().el.after(this.el)
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:description', this.render, this)
        //this.model.fetch()
        this.render()
    },
    pageChanged: function() {
        console.log("page changed")
        this.pageView = new PageView({model: this.model.get("page")})
    },
    close: function() {
        this.el.remove()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    }
})

LectureListView = Backbone.View.extend({
    tagName: "div",
    template: "lecture-list",
    events: {
        "click a": "showLecture",
        "click .add-button": "addNewLecture"
    },
    render: function() {
        this.renderTemplate()
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.collection.bind("change", this.render, this)
        this.render()
    },
    showLecture: function(ev) {
        var self = this
        var model_id = $(ev.target).attr("href")
        //this.collection.get(model_id).fetch()
        app.set({url: "lectures/" + model_id})
        return false
    },
    addNewLecture: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(title) {
            var page = new Page
            page.save().success(function() {
                var new_lecture = new Lecture({title: title, page: page})
                app.course.get('lectures').add(new_lecture)
                new_lecture.save().success(function() { app.course.save() })
            })
        })
    },
    close: function() {
        this.el.remove()
        this.collection.unbind("add", this.render, this)
    }
})

LectureTopEditView = Backbone.View.extend({
    tagName: "div",
    className: "lecture-edit",
    template: "lecture-edit",
    render: function() {
    	var self = this
        this.renderTemplate()
        Backbone.ModelBinding.bind(this)
        this.enablePlaceholders()
        var scheduled = this.model.getDate("scheduled")
        if (scheduled)
        	this.$(".scheduled-date").val((scheduled.getMonth()+1) + "/" + scheduled.getDate() + "/" + scheduled.getFullYear())
        this.$(".scheduled-date").datepicker({
        	onSelect: function(date) {
        		$(".scheduled-date:visible").val(date)
        	}
        })
        return this
    },
    events: {
        "click button.save": "save",
        "click button.cancel": "cancel"
    },
    base: ItemEditInlineView,
    save: function() {
    	var scheduled = $(".scheduled-date:visible").val() || null // TODO: why does scoping this make it not work?
    	if (scheduled) scheduled = new Date(scheduled)
    	this.model.set({scheduled: scheduled})
        ItemEditInlineView.prototype.save.apply(this)
    },
    saved: function() {
        ItemEditInlineView.prototype.saved.apply(this)
        this.model.get("course").save()
    },
    cancel: ItemEditInlineView.prototype.cancel,
    restore: ItemEditInlineView.prototype.cancel,
    close: function() {
        this.options.parent.renderTopView()
        Backbone.ModelBinding.unbind(this)
    },
    initialize: function() {
        this.el = $(this.el)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        //this.render()
    }
});

AssignmentView = Backbone.View.extend({
    tagName: "div",
    className: "assignment",
    template: "assignment",
    render: function() {
        this.renderTemplate()
        this.renderTopView()
        this.renderPageView()
        return this
    },
    renderTopView: function() {
        this.$(".assignment-top").html("").append(this.topView.render().el)
    },
    renderPageView: function() {
        this.$(".assignment-page").html("").append(this.pageView.render().el)
    },
    events: {
        "click .assignment-top .edit-button": "edit"
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:page', this.pageChanged, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.topView = new AssignmentTopView({model: this.model})
        this.pageView = new PageView({model: this.model.get("page")})
        this.model.get("page").fetch()
        this.render()
    },
    pageChanged: function() {
        console.log("page changed")
        
    },
    close: function() {
        this.el.remove()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    edit: function(){
        this.topEditView = new AssignmentTopEditView({model: this.model, parent: this})
        this.$(".assignment-top").html("").append(this.topEditView.render().el)
    },
    saved: function() {
        // save the parent too (so it stores the title), but only if the title has changed
        console.log("assignment saved")
        if (this.titleChanged) {
            this.saveParent()
            delete this.titleChanged
        }        
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    },
    saveParent: function() {
        //alert('saving parent')
        this.model.get('page').save()
    }
})

AssignmentTopView = Backbone.View.extend({
    tagName: "div",
    className: "assignment-top",
    template: "assignment-top",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
    },
    render: function() {
        this.renderTemplate()
        //this.pageView.render().el.after(this.el)
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:description', this.render, this)
        //this.model.fetch()
        this.render()
    },
    pageChanged: function() {
        console.log("page changed")
        this.pageView = new PageView({model: this.model.get("page")})
    },
    close: function() {
        this.el.remove()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    }
})

AssignmentListView = Backbone.View.extend({
    tagName: "div",
    template: "assignment-list",
    events: {
        "click a": "showAssignment",
        "click .add-button": "addNewAssignment"
    },
    render: function() {
        this.renderTemplate()
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.collection.bind("change", this.render, this)
        this.render()
    },
    showAssignment: function(ev) {
        var self = this
        var model_id = $(ev.target).attr("href")
        //this.collection.get(model_id).fetch()
        app.set({url: "assignments/" + model_id})
        return false
    },
    addNewAssignment: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(title) {
            var page = new Page
            page.save().success(function() {
                var new_assignment = new Assignment({title: title, page: page})
                app.course.get('assignments').add(new_assignment)
                new_assignment.save().success(function() { app.course.save() })
            })
        })
    },
    close: function() {
        this.el.remove()
        this.collection.unbind("add", this.render, this)
    }
})

AssignmentTopEditView = Backbone.View.extend({
    tagName: "div",
    className: "assignment-edit",
    template: "assignment-edit",
    render: function() {
    	var self = this
        this.renderTemplate()
        Backbone.ModelBinding.bind(this)
        this.enablePlaceholders()
        var due = this.model.getDate("due")
        if (due)
        	this.$(".due-date").val((due.getMonth()+1) + "/" + due.getDate() + "/" + due.getFullYear())
        this.$(".due-date").datepicker({
        	onSelect: function(date) {
        		$(".due-date:visible").val(date) // TODO: why does scoping this make it not work?
        	}
        })
        return this
    },
    events: {
        "click button.save": "save",
        "click button.cancel": "cancel"
    },
    base: ItemEditInlineView,
    save: function() {
    	var due = $(".due-date:visible").val() || null // TODO: why does scoping this make it not work?
    	if (due) due = new Date(due)
    	this.model.set({due: due})
        ItemEditInlineView.prototype.save.apply(this)
    },
    saved: function() {
        ItemEditInlineView.prototype.saved.apply(this)
        this.model.get("course").save()
    },
    cancel: ItemEditInlineView.prototype.cancel,
    restore: ItemEditInlineView.prototype.cancel,
    close: function() {
        this.options.parent.renderTopView()
        Backbone.ModelBinding.unbind(this)
    },
    initialize: function() {
        this.el = $(this.el)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        //this.render()
    }
});

ScheduleView = Backbone.View.extend({
    tagName: "div",
    className: "section border2",
    template: "schedule-section",
    buttonFadeSpeed: 60,
    render: function() {
        this.renderTemplate()
        return this
    },
    events: {
        // "mouseenter .section-inner": "showBottomActionButtons",
        // "mouseleave .section-inner": "hideAllActionButtons",
        // "mouseenter .sectiontitle": "showTopActionButtons",
        // "mouseout .sectiontitle": "hideTopActionButtons",
        // "mouseenter .items": "hideTopActionButtons",
        // "click .section-button.add-button": "addNewItem",
        // "click .section-button.delete-button": "delete"
    },
    initialize: function() {
        this.dateViews = {}
        this.itemViews = []
        this.el = $(this.el)
        if (!this.model)
        	this.model = app.course // TODO: not hard code this to global namespace?
        this.model.bind("add:lectures", this.addLectures, this)
        this.model.bind("add:assignments", this.addAssignments, this)
        this.render()
        for (var i=0; i < this.model.get('lectures').length; i++)
            this.addLectures(this.model.get('lectures').at(i))
        for (var i=0; i < this.model.get('assignments').length; i++)
            this.addAssignments(this.model.get('assignments').at(i))
    },
    addAssignments: function(model, coll) {
        var itemView = new ScheduleItemView({model: model, type: "Assignment", url: "assignments/" + model.id})
        var dateView = this.getOrCreateDateView(model.getDate("due"))
        if (dateView)
        	dateView.$(".schedule-items").append(itemView.render().el)
    },
    addLectures: function(model, coll) {
        var itemView = new ScheduleItemView({model: model, type: "Lecture", url: "lectures/" + model.id})
        var dateView = this.getOrCreateDateView(model.getDate("scheduled"))
        if (dateView)
        	dateView.$(".schedule-items").append(itemView.render().el)
    },
    getOrCreateDateView: function(date) {
    	if (!date) return
    	if (!this.dateViews[date]) {
    		var insertAfter = null
    		for (var oldDate in this.dateViews) {
    			oldDate = new Date(oldDate)
    			if (oldDate < date && (!insertAfter || (insertAfter < oldDate)))
    				insertAfter = oldDate
    		}
    		this.dateViews[date] = new ScheduleDateView({date: date})
    		if (insertAfter)
    			this.dateViews[insertAfter].el.after(this.dateViews[date].render().el)
    		else
    			this.$(".schedule-inner").prepend(this.dateViews[date].render().el)
    	}
    	return this.dateViews[date]
    }
})

ScheduleDateView = Backbone.View.extend({
    tagName: "tr",
    className: "date",
    template: "schedule-date",
    render: function() {
        this.renderTemplate({data: {date: this.options.date.toDateString()}})
        return this
    },
    events: {
        // "mouseenter .section-inner": "showBottomActionButtons",
        // "mouseleave .section-inner": "hideAllActionButtons",
        // "mouseenter .sectiontitle": "showTopActionButtons",
        // "mouseout .sectiontitle": "hideTopActionButtons",
        // "mouseenter .items": "hideTopActionButtons",
        // "click .section-button.add-button": "addNewItem",
        // "click .section-button.delete-button": "delete"
    },
    initialize: function() {
        this.dateViews = {}
        this.el = $(this.el)
        this.render()
    }
})

ScheduleItemView = Backbone.View.extend({
    tagName: "div",
    className: "schedule_item",
    template: "schedule-item",
    render: function() {
        this.renderTemplate({data: {item: this.model.attributes, options: this.options}})
        this.hookURLs()
        return this
    },
    events: {
        // "mouseenter .section-inner": "showBottomActionButtons",
        // "mouseleave .section-inner": "hideAllActionButtons",
        // "mouseenter .sectiontitle": "showTopActionButtons",
        // "mouseout .sectiontitle": "hideTopActionButtons",
        // "mouseenter .items": "hideTopActionButtons",
        // "click .section-button.add-button": "addNewItem",
        // "click .section-button.delete-button": "delete"
    },
    initialize: function() {
        this.el = $(this.el)
        //this.model.bind("change", this.update, this)
        this.render()
    },
    update: function() {
    	
    }
})
;

HomeView = Backbone.View.extend({
    tagName: "div",
    className: "home",
    template: "home", 
    render: function() {
    	this.renderTemplate()
    	this.scheduleView = new ScheduleView
    	this.el.append(this.scheduleView.el)
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.render()
    }
})

;


/* ----- Handlebars ----- */

// give access to all templates as partials
Handlebars.partials = Handlebars.templates


/* ----- Backbone ----- */

var Dispatcher = _.extend({}, Backbone.Events)

// change the id attribute to use Mongo's _id
Backbone.Model.prototype.idAttribute = "_id";

Backbone.Model.prototype.getDate = function(attr) {
	var date = this.get(attr)
	if (!date) return undefined
	date = new Date(date)
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)
    return date
}

// set default data-binding attribute name to "field", globally
Backbone.ModelBinding.Configuration.configureAllBindingAttributes("data")

// a modification to the standard Backbone ModelBinding Convention, so it won't
// overwrite form fields that are currently active (thereby moving cursor to end)
StandardBindingIgnoringActiveInput = (function(Backbone){
    var methods = {}

    var _getElementType = function(element) {
        var type = element[0].tagName.toLowerCase()
        if (type == "input"){
            type = element.attr("type")
            if (type == undefined || type == ''){
                type = 'text'
            }
        }
        return type
    }

    methods.bind = function(selector, view, model, config){
        var modelBinder = this

        view.$(selector).each(function(index){
            var element = view.$(this)
            var elementType = _getElementType(element)
            var attribute_name = config.getBindingValue(element, elementType)

            var modelChange = function(changed_model, val){
                if (!element.is(":focus"))
                    element.val(val)
            }

            var setModelValue = function(attr_name, value){
                var data = {}
                data[attr_name] = value
                model.set(data)
            }

            var elementChange = function(ev){
                setModelValue(attribute_name, view.$(ev.target).val())
            }

            modelBinder.registerModelBinding(model, attribute_name, modelChange)
            modelBinder.registerElementBinding(element, elementChange)

            // set the default value on the form, from the model
            var attr_value = model.get(attribute_name)
            if (typeof attr_value !== "undefined" && attr_value !== null) {
                element.val(attr_value)
            } else {
                var elVal = element.val()
                if (elVal){
                    setModelValue(attribute_name, elVal)
                }
            }
        })
    }

    return methods
})(Backbone)

// set all the "texty" ModelBinding conventions to use the handler defined above
Backbone.ModelBinding.Conventions.text.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.textarea.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.password.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.number.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.tel.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.search.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.url.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.email.handler = StandardBindingIgnoringActiveInput


// reorder the models in a collection by a list of ids (e.g. from jquery ui sortable)
Backbone.Collection.prototype.reorder = function(order) {
    var new_models = []
    for (var i=0; i < order.length; i++) {
        new_models[i] = this.get(order[i])
    }
    this.models = new_models
    Dispatcher.trigger("resized")
    return this
}

// render a view's template using its model data, then write it to the element
Backbone.View.prototype.renderTemplate = function(options) {
    var settings = _.extend({target: this.el, template: this.template}, options)
    settings.data = settings.data || (settings.model && settings.model.attributes)
                                  || (settings.collection)
                                  || (this.model && this.model.attributes)
                                  || (this.collection) || {}  
    var html = Handlebars.templates[settings.template](settings.data)
    if (settings.target)
        this.$(settings.target).html(html)
    else
        return html
}

// turn straight "a" links into router navigations
Backbone.View.prototype.hookURLs = function() {
	this.$("a").each(function(ind,el) {
		$(el).click(function(ev) {
			app.set({url: $(this).attr("href")})
			return false
		})
	})
}

// set a view's Bootstrap grid system width according to its model's "width" property 
Backbone.View.prototype.updateWidth = function() {
    this.el.attr('class', this.el[0].className.replace(/\w*\bspan\d+\b/g, ''))
    var width = Math.max(this.model.get("width"), this.editView && this.editView.minwidth || 4) 
    if (isFinite(width))
        this.el.addClass("span" + width)
    Dispatcher.trigger("resized")
}

Backbone.View.prototype.enablePlaceholders = function() {
    this.$("[placeholder]").each(function(ind, el) {
        $(el).watermark($(el).attr("placeholder"), {})
        $(el).attr("title", $(el).attr("placeholder"))
    })
}

Backbone.Model.prototype.parse = function(data) {
    $("#jsoncode").text(JSON.stringify(data))
    return data
}

// add in a "save" event to be fired when a model is saved
Backbone.Model.prototype.save_original = Backbone.Model.prototype.save
Backbone.Model.prototype.save = function() {
    this.trigger("save", this)
    return Backbone.Model.prototype.save_original.apply(this, arguments)
} 
;

function dialog_from_template(template_name, data, options) {
    show_dialog(Handlebars.templates[template_name](data), options)
}

function show_dialog(html, options) {
    return $("<div>" + html + "</div>").dialog(_.extend({
        resizable: false,
        modal: true,
        dialogClass: 'alert'
    }, options))
}

function delete_section_confirmation(model, delete_callback, options) {
    dialog_from_template("dialog-section-delete", model.attributes, _.extend({ 
        buttons: {
            "delete": {
                html: "Yes, delete!",
                "class": "btn danger",
                click: function() {
                    delete_callback()
                    $(this).dialog("close")
                }
            },
            "cancel": {
                html: "Cancel",
                "class": "btn",
                click: function() {
                    $(this).dialog("close")
                }
            }
        },
        closeOnEscape: true
    }, options))
}

function dialog_request_response(request, callback) {
    var rand_id = Math.random().toString().slice(2)
    var dialog = show_dialog("<input id='" + rand_id + "' />", {
        title: request, 
        buttons: {
            "save": {
                html: "Save",
                "class": "btn success dialog-save-button",
                click: function() {
                	if ($("#" + rand_id).val()) {
	                    callback($("#" + rand_id).val())
	                    $("#" + rand_id).val("")                		
                	}
                    $(this).dialog("close")
                }
            },
            "cancel": {
                html: "Cancel",
                "class": "btn",
                click: function() {
                    $(this).dialog("close")
                }
            }
        }
    })
    dialog.keypress(function(ev) {
    	if (ev.which==13) {
    		$(".dialog-save-button").click()
    		return false
    	}
    })
};

ckeditor_config = {}

ckeditor_config.toolbar =
[
    { name: 'document', items : [ 'Source','-','Save','-','Templates' ] },
    { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
    //{ name: 'editing', items : [ 'Find','Replace','-','SelectAll' ] },
    //'/',
    { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
    { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-',
        'JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] },
    { name: 'links', items : [ 'Link','Unlink' ] },
    { name: 'insert', items : [ 'Image','Table','HorizontalRule','SpecialChar' ] },
    //'/',
    { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
    { name: 'colors', items : [ 'TextColor','BGColor' ] },
    { name: 'tools', items : [ 'Maximize', 'ShowBlocks' ] }
];

var App = Backbone.Model.extend({
    initialize: function() {
        var self = this 
    },
    defaults: {
        tabs: [
            {title: "Home", route: ""},
            {title: "Lectures", route: "lectures"},
            {title: "Assignments", route: "assignments"}
        ]
    }
})

var AppView = Backbone.View.extend({
    el: "#content",
    initialize: function() {
        this.el = $(this.el)
        this.model.bind("change:topview", this.viewChanged, this)
        this.model.bind("change:url", this.urlChanged, this)
    },
    viewChanged: function() {
        if (app.previous("topview") && app.previous("topview").close)
            app.previous("topview").close()
        this.el.html("").append(app.get("topview").render().el)
    },
    urlChanged: function(model, new_url) {
        // if the url starts with a slash, strip that off first
        if (new_url[0]=="/") return this.model.set({url: new_url.slice(1)})
        this.model.set({tab: new_url.split("/")[0]})
        Backbone.history.navigate(new_url, true)
    }
})

var MainRouter = Backbone.Router.extend({

    routes: {
        "":                                     "home",
        "lectures":                             "lecture",
        "lectures/:lecture":                    "lecture",
        "lectures/:lecture/page/:page":         "lecture",
        "assignments":                          "assignment",
        "assignments/:assignment":              "assignment",
        "assignments/:assignment/page/:page":   "assignment"
    },
    
    initialize: function() {

    },

    home: function() {
        app.set({topview: new HomeView({model: app.course})})
    },
    
    lecture: function(lecture, page) {
        //$("#content").text("lecture " + lecture + " (page " + page + ")")
        var topview
        if (lecture) {
            var model = app.course.get('lectures').get(lecture)
            topview = new LectureView({model: model})
            model.fetch().then(function() { model.fetchRelated() })
        } else {
            topview = new LectureListView({collection: app.course.get('lectures')}) 
        }
        app.set({topview: topview})
    },

    assignment: function(assignment, page) {
        var topview
        if (assignment) {
            var model = app.course.get('assignments').get(assignment)
            topview = new AssignmentView({model: model})
            model.fetch().then(function() { model.fetchRelated() })
        } else {
            topview = new AssignmentListView({collection: app.course.get('assignments')}) 
        }
        app.set({topview: topview})
    }

})

TabView = Backbone.View.extend({
    tagName: "li",
    render: function() {
        this.el.html("<a href='/" + this.options.route + "'>" + this.options.title + "</a>")
        return this
    },
    initialize: function() {
        this.el = $(this.el)
    },
    events: {
        "click a": "linkClicked"
    },
    linkClicked: function(ev) {
        ev.preventDefault()
        app.set({url: this.options.route})
        return false
    }
})

TabsView = Backbone.View.extend({
    el: "#toptabs",
    tagName: "ul",
    className: "pills",
    render: function() {
        var self = this
        this.el.html("")
        _.each(this.tabViews, function(tabView) {
            self.el.append(tabView.render().el)
        })
    },
    initialize: function() {
        this.tabViews = []
        this.el = $(this.el)
        app.bind("change:tab", this.tabChanged, this)
        app.bind("change:tabs", this.tabsChanged, this)
        app.bind("change", this.changed, this)
        this.tabsChanged()
        this.render()
    },
    tabsChanged: function() {
        var self = this
        this.tabViews = []
        _.each(app.get('tabs'), function(tab) {
            self.tabViews.push(new TabView(tab)) 
        })
    },
    tabChanged: function(model, tab) {
        _.each(this.tabViews, function(tabView) {
            tabView.el.toggleClass("active", tabView.options.route==tab)
        })
    },
    changed: function() {
        
    }
})

$(function() {

	if (!window.base_url)
    	base_url = window.location.pathname.split("/").slice(0,3).join("/") + "/"

	if (!window.course_id)
    	course_id = window.location.pathname.split("/")[2]

    window.app = new App

    app.course = new Course({_id: course_id}) //4ecdcece5ce3fac87f000001"})
    app.course.fetch().then(function() {
    
        app.tabView = new TabsView
        app.router = new MainRouter
        app.view = new AppView({model: app})
        
        Backbone.history.start({pushState: true, root: base_url}) 
                
        app.set({url: Backbone.history.fragment})
    
    })
})