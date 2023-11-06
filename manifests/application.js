/* jshint indent:false */

(function(window) {
// # Pie
// The top level namespace of the framework.
var pie = window.pie = {

  apps: {},

  /* native extensions */
  array: {},
  browser: {},
  date: {},
  dom: {},
  fn: {},
  math: {},
  object: {},
  string: {},

  /* extensions to be used within pie apps. */
  mixins: {},

  __pieId: 1,


  // ** pie.guid **
  //
  // Generate a globally unique id.
  guid: function() {
    var r, v;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      r = Math.random()*16|0,
      v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },

  // ** pie.ns **
  //
  // If it's not already present, build a path on `base`.
  // By default, `base` is the global `window`.
  // The deepest namespace object is returned so you can immediately use it.
  // ```
  // pie.ns('lib.foo.bar').baz = function(){};
  // //=> generates { lib: { foo: { bar: { baz: function(){} } } } }
  // ```
  ns: function(path, base) {
    base = base || window;
    return pie.object.getPath(base, path) || pie.object.setPath(base, path, {});
  },

  // ** pie.qs **
  //
  // Alias for `document.querySelector`
  qs: function() {
    return document.querySelector.apply(document, arguments);
  },

  // ** pie.qsa **
  //
  // Alias for `document.querySelectorAll`
  qsa: function() {
    return document.querySelectorAll.apply(document, arguments);
  },

  // ** pie.uid **
  //
  // Set the `__pieId` of `obj` if it isn't already present.
  uid: function(obj) {
    return obj.__pieId = obj.__pieId || pie.unique();
  },

  // ** pie.unique **
  //
  // Provide a unique integer not yet used by pie.
  // This is good for unique local ids.
  unique: function() {
    return String(this.__pieId++);
  },

  // ** pie.util **
  //
  // Provide a util object for your app which utilizes pie's features.
  // ```
  // window._ = pie.util();
  // _.a.detect(/* .. */);
  // _.o.merge(a, b);
  // _.unique(); //=> '95'
  // ```
  util: function() {
    var o = {};

    o.a   = pie.array;
    o.b   = pie.browser;
    o.d   = pie.date;
    o.$   = pie.dom;
    o.fn  = pie.fn;
    o.m   = pie.math;
    o.o   = pie.object;
    o.s   = pie.string;
    o.x   = pie.mixins;

    o.guid    = pie.guid;
    o.ns      = pie.ns;
    o.qs      = pie.qs;
    o.qsa     = pie.qsa;
    o.setUid  = pie.uid;
    o.unique  = pie.unique;

    return o;
  },

  _debugArgs: function(msg) {
    return ["%c[pie] %c" + msg, "color: orange; font-weight: bold;", "color: inherit; font-weight: inherit;"];
  }

};
// # Pie Array Utilities
// A series of helpful methods for working with arrays.

// ** pie.array.areAll **
//
// Provides a way to test if all items of `a` match the function `f`.
// Since this uses `pie.object.getValue` you can pass an attribute name for `f` as well.
// ```
// pie.array.areAll([0,1,2,3,4], function(x){ return x % 2 === 0; });
// //=> false
//
// pie.array.areAll([o1,o2], 'computed')
// //=> !!(o1.computed && o2.computed)
// ```
pie.array.areAll = function(a, f) {
  a = pie.array.from(a);
  var i = 0;
  for(;i < a.length; i++) {
    if(!pie.object.getValue(a[i], f)) return false;
  }
  return true;
};

// ** pie.array.areAny **
//
// Tests whether any items of `a` match the function `f`.
// Since this uses `pie.object.getValue` you can pass an attribute name for `f` as well.
// ```
// pie.array.areAny([0,1,2,3,4], function(x){ return x % 2 === 0; });
// //=> true
//
// pie.array.areAny([o1,o2], 'computed')
// // => !!(o1.computed || o2.computed)
// ```
pie.array.areAny = function(a, f) {
  a = pie.array.from(a);
  var i = 0;
  for(;i < a.length; i++) {
    if(pie.object.getValue(a[i], f)) return true;
  }
  return false;
};

// ** pie.array.avg **
//
// Find the average of a series of numbers.
// ```
// pie.array.avg([1,2,3,4,5,8])
// //=> 3.8333
// ```
pie.array.avg = function(a) {
  a = pie.array.from(a);
  var s = pie.array.sum(a), l = a.length;
  return l ? (s / l) : 0;
};

// ** pie.array.change **
//
// Change an array by many `pie.array` utilities.
// ```
// pie.array.change(arguments, 'from', 'flatten', 'compact', 'unique');
// // is equivalent to:
// arr = pie.array.from(arguments);
// arr = pie.array.flatten(arr);
// arr = pie.array.compact(arr);
// arr = pie.array.unique(arr);
// ```
pie.array.change = function() {
  var args = pie.array.from(arguments),
  arr = args.shift();
  args.forEach(function(m) {
    arr = pie.array[m](arr);
  });

  return arr;
};

// ** pie.array.compact **
//
// Remove all null or undefined items.
// Optionally remove all falsy values by providing true for `removeAllFalsy`.
// ```
// pie.array.compact([true, false, null, undefined, 1, 0])
// //=> [true, false, 1, 0]
//
// pie.array.compact([true, false, null, undefined, 1, 0], true)
// //=> [true, 1]
// ```
pie.array.compact = function(a, removeAllFalsy){
  a = pie.array.from(a);
  return a.filter(function(i){
    /* jslint eqeq:true */
    return removeAllFalsy ? !!i : (i != null);
  });
};

// ** pie.array.count **
//
// Count the number of items that match a given criteria defined by `f`.
// ```
// pie.array.count([0, 1, 2, 3], function(i){ return i % 2 === 0; });
// //=> 2
//
// pie.array.count(['foo', 'bar', 'q', 'ux'], function(i){ return i.length === 3; })
// //=> 2
// ```
pie.array.count = function(a, f) {
  var cnt = 0;
  pie.array.from(a).forEach(function(i){
    if(pie.object.getValue(i, f)) cnt++;
  });
  return cnt;
};

// ** pie.array.detect **
//
// Return the first item where the provided function evaluates to a truthy value.
// If a function is not provided, the second argument will be assumed to be an attribute check.
// ```
// pie.array.detect([1,3,4,5], function(e){ return e % 2 === 0; })
// //=> 4
//
// pie.array.detect([{foo: 'bar'}, {baz: 'foo'}], 'baz')
// //=> {baz: 'foo'}
// ```
pie.array.detect = function(a, f) {
  a = pie.array.from(a);
  var i = 0, l = a.length;
  for(;i<l;i++) {
    if(pie.object.getValue(a[i], f)) {
      return a[i];
    }
  }
};

// ** pie.array.detectLast **
//
// Return the last item where the provided function evaluates to a truthy value.
// If a function is not provided, the second argument will be assumed to be an attribute check.
// ```
// pie.array.detectLast([1,2,4,5], function(e){ return e % 2 === 0; })
// //=> 4
//
//
// pie.array.detectLast([{foo: 'bar'}, {baz: 'foo'}], 'baz')
// //=> {baz: 'foo'}
// ```
pie.array.detectLast = function(a, f) {
  a = pie.array.from(a);
  var i = a.length-1, l = 0;
  for(;i>=l;i--) {
    if(pie.object.getValue(a[i], f)) {
      return a[i];
    }
  }
};

// ** pie.array.dup **
//
// Return a new array containing the same values of the provided array `a`.
pie.array.dup = function(a) {
  return pie.array.from(a).slice(0);
};

// ** pie.array.each **
//
// Invoke `f` on each item of a.
// `f` can be a function or the name of a function to invoke.
// ```
// pie.array.each(arr, 'send');
// ```
pie.array.each = function(a, f) {
  return pie.array._each(a, f, true, 'forEach');
};

pie.array._each = function(a, f, callInternalFunction, via) {
  var callingF;

  if(!pie.object.isFunction(f)) {
    callingF = function(e){
      var ef = e[f];

      if(callInternalFunction && pie.object.isFunction(ef))
        return ef.apply(e);
      else
        return ef;
    };
  } else {
    callingF = f;
  }

  return pie.array.from(a)[via](function(e){ return callingF(e); });
};


// ** pie.array.filter **
//
// Return the elements of the array that match `fn`.
// The `fn` can be a function or attribut of the elements.
// ```
// var arr = ['', ' ', 'foo'];
// pie.array.filter(arr, 'length');
// //=> [' ', 'foo']
// ```
pie.array.filter = function(arr, fn) {
  return pie.array.from(arr).filter(function(i){
    return pie.object.getValue(i, fn);
  });
};


// ** pie.array.flatten **
//
// Flattens an array of arrays or elements into a single depth array
// ```
// pie.array.flatten(['a', ['b', 'c']])
// //=> ['a', 'b', 'c']
// ```
// You may also restrict the depth of the flattening:
// ```
// pie.array.flatten([['a'], ['b', ['c']]], 1)
// //=> ['a', 'b', ['c']]
// ```
pie.array.flatten = function(a, depth, into) {
  into = into || [];

  if(Array.isArray(a) && depth !== -1) {

    if(depth != null) depth--;

    a.forEach(function(e){
      pie.array.flatten(e, depth, into);
    });

  } else {
    into.push(a);
  }

  return into;
};

// ** pie.array.from **
//
// Return an array from a value. if the value is an array it will be returned.
// If the value is a NodeList or an HTMLCollection, you will get back an array.
// If the value is undefined or null, you'll get back an empty array.
// ```
// pie.array.from(null)
// //=> []
//
// pie.array.from(['foo'])
// //=> ['foo']
//
// pie.array.from('value')
// //=> ['value']
//
// pie.array.from(document.querySelectorAll('body'))
// //=> [<body>]
// ```
pie.array.from = function(value) {
  if(Array.isArray(value)) return value;
  if(pie.object.isArguments(value) || pie.object.instanceOf(value, 'NodeList') || pie.object.instanceOf(value, 'HTMLCollection')) return Array.prototype.slice.call(value, 0);
  return pie.array.compact([value], false);
};

// ** pie.array.get **
//
// Retrieve a value or a range of values from an array.
// Negative values are allowed and are considered to be relative to the end of the array.
// ```
// arr = ['a', 'b', 'c', 'd', 'e']
// pie.array.get(arr, 1)
// //=> 'b'
//
// pie.array.get(arr, -2)
// //=> 'd'
//
// pie.array.get(arr, -1)
// //=> 'e'
//
// pie.array.get(arr, 1, -2)
// //=> ['b', 'c', 'd']
// ```
pie.array.get = function(arr, startIdx, endIdx) {
  arr = pie.array.from(arr);
  if(startIdx < 0) startIdx += arr.length;

  if(endIdx !== undefined) {
    if(endIdx < 0) endIdx += arr.length;
    return arr.slice(startIdx, endIdx + 1);
  }

  return arr[startIdx];
};

// ** pie.array.grep **
//
// Return string based matches of `regex` from the provided array `arr`.
// ```
// arr = ['foo', 'too', 'bar', 'baz', 'too']
// pie.array.grep(arr, /oo/)
// //=> ['foo', 'too', 'too']
// ```
pie.array.grep = function(arr, regex) {
  return pie.array.from(arr).filter(function(a){ return regex.test(String(a)); });
};


// ** pie.array.groupBy **
//
// Construct an object of arrays representing the items grouped by `groupingF`.
// The grouping function can be a function or an attribute of the objects.
// ```
// arr = [0,1,2,3,4,5]
// fn = function(x){ return x % 2 === 0; }
// pie.array.groupBy(arr, fn)
// //=> { true : [0, 2, 4], false : [1, 3, 5] }
// ```
pie.array.groupBy = function(arr, groupingF) {
  var h = {}, g;
  pie.array.from(arr).forEach(function(a){

    g = pie.object.getValue(a, groupingF);

    /* jslint eqeq:true */
    if(g != null) {
      h[g] = h[g] || [];
      h[g].push(a);
    }
  });

  return h;
};

// ** pie.array.hasAll **
//
// Determine if the given array `a` has all of the provided values.
// ```
// arr = ["foo", "bar", "baz"]
// pie.array.hasAll(arr, "foo")
// //=> true
// pie.array.hasAll(arr, "foo", "bar")
// //=> true
// pie.array.hasAll(arr, ["food", "bar"])
// //=> false
// pie.array.hasAll(arr, "qux")
// //=> false
pie.array.hasAll = function(/* a, *values */) {
  var a = pie.array.from(arguments[0]),
  values = pie.array.get(arguments, 1, -1), i;
  values = pie.array.flatten(values);
  for(i=0;i<values.length;i++) {
    if(!~a.indexOf(values[i])) return false;
  }
  return true;
};

// ** pie.array.hasAny **
//
// Determine if the given array `a` has any of the provided values.
// ```
// arr = ["foo", "bar", "baz"]
// pie.array.hasAny(arr, "foo")
// //=> true
// pie.array.hasAny(arr, ["food", "bar"])
// //=> true
// pie.array.hasAny(arr, "qux")
// //=> false
pie.array.hasAny = function(/* a, *values */) {
  var a = pie.array.from(arguments[0]),
  values = pie.array.get(arguments, 1, -1), i;
  values = pie.array.flatten(values);
  for(i=0;i<values.length;i++) {
    if(~a.indexOf(values[i])) return true;
  }
  return !values.length;
};

// ** pie.array.indexOf **
//
// Find the first index of the item that matches `f`.
// The function `f` can be a function or an attribute.
// ```
// arr = [{foo: true}, {bar: true}, {bar: true, foo: true}]
// pie.array.indexOf(arr, 'foo')
// //=> 0
// ```
pie.array.indexOf = function(a, f, startIdx) {
  a = pie.array.from(a);
  for(var i = (startIdx || 0); i < a.length; i++) {
    if(pie.object.getValue(a[i], f)) {
      return i;
    }
  }

  return -1;
};

// ** pie.array.lastIndexOf **
//
// Find the last index of the item that matches `f`.
// The function `f` can be a function or an attribute.
// ```
// arr = [{foo: true}, {bar: true}, {bar: true, foo: true}]
// pie.array.lastIndexOf(arr, 'foo')
// //=> 2
// ```
pie.array.lastIndexOf = function(a, f, startIdx) {
  a = pie.array.from(a);
  for(var i = (startIdx === undefined ? a.length - 1 : startIdx); i >= 0; i--) {
    if(pie.object.getValue(a[i], f)) {
      return i;
    }
  }
}

// ** pie.array.inGroupsOf **
//
// Break the array into groups of the desired count.
// If the length is not divisible by the desired count,
// the last group will be shorter.
// ```
// var a = [0,1,2,3,4,5,6,7];
// pie.array.inGroupsOf(a, 3);
// //=> [[0,1,2], [3,4,5], [6,7]];
// ```
pie.array.inGroupsOf = function(a, count) {
  a = pie.array.from(a);
  var out = [], sub;
  for(var i = 0; i < a.length; i++) {

    if(i % count === 0) {
      if(sub) out.push(sub);
      sub = [];
    }

    sub.push(a[i]);
  }

  if(sub.length) out.push(sub);

  return out;
};

// ** pie.array.intersect **
//
// Retrieve the intersection of two arrays `a` and `b`.
// ```
// a = [0, 1, 2, 3, 4]
// b = [0, 2, 4, 6, 8]
// pie.array.intersect(a, b)
// //=> [0, 2, 4]
// ```
pie.array.intersect = function(a, b) {
  b = pie.array.from(b);
  return pie.array.from(a).filter(function(i) { return ~b.indexOf(i); });
};


// ** pie.array.last **
//
// Retrieve the last item of the array.
pie.array.last = function(arr) {
  arr = arr && pie.array.from(arr);
  if(arr && arr.length) return arr[arr.length - 1];
};


// ** pie.array.map **
//
// Return an array filled with the return values of `f`.
// If f is not a function, it will be assumed to be a key of the item.
// If the resulting value is a function, it can be invoked by passing true as the third argument.
// ```
// pie.array.map(["a", "b", "c"], function(e){ return e.toUpperCase(); })
// //=> ["A", "B", "C"]
//
// pie.array.map(["a", "b", "c"], 'length')
// //=> [1, 1, 1]
//
// pie.array.map([0,1,2], 'toFixed')
// //=> [toFixed(){}, toFixed(){}, toFixed(){}]
//
// pie.array.map([0,1,2], 'toFixed', true)
// //=> ["0", "1", "2"]
// ```
pie.array.map = function(a, f, callInternalFunction){
  return pie.array._each(a, f, callInternalFunction, 'map');
};

// **pie.array.partition**
//
// Partition an array based on a set of functions. You will end up with an array of arrays the length of which
// will be fns.length + 1.
// ```
// var arr = [0, 1, 2, 3, 4];
// var results = pie.array.partition(arr, isOdd);
// var odds = results[0];
// //=> [1, 3]
// var evens = results[1];
// //=> [0, 2, 4]
// ```
// ```
// var arr = ["a", 4, true, false, 5, "b"];
// var results = pie.array.partition(arr, pie.object.isString, pie.object.isNumber);
// var strings = results[0];
// //=> ["a", "b"]
// var numbers = results[1];
// //=> [4, 5]
// var others = results[2];
// //=> [true, false]
// ```
pie.array.partition = function(/* a, fn1, fn2 */) {
  var out = [],
  fns = pie.array.from(arguments),
  arr = pie.array.from(fns.shift());

  fns.forEach(function(fn, j){
    out[j] = [];
    out[j+1] = out[j+1] || [];
    arr.forEach(function(e){
      if(!!pie.object.getValue(e, fn)) out[j].push(e);
      else out[j+1].push(e);
    });

    arr = pie.array.dup(out[j+1]);
  });

  return out;
};

// **pie.array.partitionAt**
//
// Split an array up at the first occurrence where fn evaluates to true.
// ```
// arr = [a(), b(), "string", "string", c()]
// pie.array.partitionAt(arr, pie.object.isNotFunction)
// //=> [ [a(), b()], ["string", "string", c()] ]
// ```
pie.array.partitionAt = function(arr, fn) {
  var a = [], b = [], stillA = true;

  pie.array.from(arr).forEach(function(i){
    if(stillA && !!pie.object.getValue(i, fn)) stillA = false;
    (stillA ? a : b).push(i);
  });

  return [a, b];
};


// ** pie.array.remove **
//
// Remove all occurences of object `o` from array `a`.
// ```
// a = [0, 1, 3, 5, 0, 2, 4, 0]
// pie.array.remove(a, 0)
// //=> [1, 3, 5, 2, 4]
pie.array.remove = function(a, o) {
  a = pie.array.from(a);
  var idx;
  while(~(idx = a.indexOf(o))) {
    a.splice(idx, 1);
  }
  return a;
};


// ** pie.array.subtract **
//
// Return an array that consists of any `a` elements that `b` does not contain.
// ```
// a = [0, 1, 2, 3, 4]
// b = [0, 2, 4, 6, 8]
// pie.array.subtract(a, b)
// //=> [1, 3]
pie.array.subtract = function(a, b) {
  return pie.array.from(a).filter(function(i) { return !~b.indexOf(i); });
};

// ** pie.array.sum **
//
// Sum the values of `a` and return a float.
// ```
// arr = [1, 2, 5]
// pie.array.sum(arr)
// //=> 8.0
// ```
pie.array.sum = function(a) {
  return pie.array.from(a).reduce(function(a,b){ return a + parseFloat(b); }, 0);
};

// ** pie.array.sortBy **
//
// Sort the array based on the value dictated by the function `sortF`.
// The function can also be an attribute of the array's items.
// ```
// arr = [{name: 'Doug'}, {name: 'Alex'}, {name: 'Bill'}]
// pie.array.sortBy(arr, 'name')
// //=> [{name: 'Alex'}, {name: 'Bill'}, {name: 'Doug'}]
// ```
pie.array.sortBy = function(arr, sortF){
  var aVal, bVal;
  return pie.array.from(arr).sort(function(a, b) {
    aVal = pie.object.getValue(a, sortF);
    bVal = pie.object.getValue(b, sortF);
    if(aVal === bVal) return 0;
    if(aVal < bVal) return -1;
    return 1;
  });
};


// ** pie.array.toSentence **
//
// Convert a series of words into a human readable sentence.
// Available options:
//   * **i18n** - the i18n instance to be used for lookups. Defaults to `pie.appInstance.i18n`.
//   * **delimeter** - the delimeter to be placed between the 0 - N-1 items. Defaults to `', '`.
//   * **conjunction** - the conjunction to be placed between the last two items. Defaults to `' and '`.
//   * **punctuate** - the punctuation to be added to the end. If `true` is provided, a `'.'` will be used. Defaults to none.
//
// ```
// words = ['foo', 'bar', 'baz']
// pie.array.toSentence(words)
// "foo, bar and baz"
// ```
pie.array.toSentence = function(arr, options) {
  arr = pie.array.from(arr);
  if(!arr.length) return '';

  options = pie.object.merge({
    i18n: pie.object.getPath(pie, 'appInstance.i18n')
  }, options);

  options.delimeter = options.delimeter || options.i18n && options.i18n.t('app.sentence.delimeter', {default: ', '});
  options.conjunction = options.conjunction || options.i18n && options.i18n.t('app.sentence.conjunction', {default: ' and '});
  options.punctuate = options.punctuate === true ? '.' : options.punctuate;

  if(arr.length > 2) arr = [arr.slice(0,arr.length-1).join(options.delimeter), arr.slice(arr.length-1)];

  var sentence = arr.join(options.conjunction);
  if(options.punctuate && !pie.string.endsWith(sentence, options.punctuate)) sentence += options.punctuate;

  return sentence;
};


// ** pie.array.union **
//
// Return the union of N provided arrays.
// a = [1, 2]
// b = [2, 3, 4]
// c = [3, 4, 5]
// pie.array.union(a, b, c)
// //=> [1, 2, 3, 4, 5]
pie.array.union = function() {
  var arrs = pie.array.from(arguments);
  arrs = pie.array.compact(arrs, true);
  arrs = pie.array.flatten(arrs);
  arrs = pie.array.unique(arrs);
  return arrs;
};


// ** pie.array.unique **
//
// Remove any duplicate values from the provided array `arr`.
// ```
// arr = [0, 1, 3, 2, 1, 0, 4]
// pie.array.unique(arr)
// [0, 1, 3, 2, 4]
// ```
pie.array.unique = function(arr) {
  return pie.array.from(arr).filter(function(e, i){ return arr.indexOf(e) === i; });
};
/* From old jQuery */
pie.browser.agent = function() {
  if(pie.browser.__agent) return pie.browser.__agent;

  var ua = navigator.userAgent.toLowerCase(),
  match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
    /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
    /(msie) ([\w.]+)/.exec( ua ) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
    [];

  var b = {
    browser: match[ 1 ] || "",
    version: match[ 2 ] || "0"
  };

  if(b.browser) {
    b[b.browser] = true;
  }

  // Chrome is Webkit, but Webkit is also Safari.
  if ( b.chrome ) {
    b.webkit = true;
  } else if ( b.webkit ) {
    b.safari = true;
  }

  match = /(ipad|ipod|iphone)/.exec( ua );

  if (match && match[1]) {
    b.iDevice = match[1];
    b[b.iDevice] = true;
  }

  return pie.browser.__agent = b;
};

pie.browser.getCookie = function(key, options) {
  var decode = options && options.raw ? function(s) { return s; } : decodeURIComponent,
  pairs = document.cookie.split('; '),
  pair;

  for(var i = 0; i < pairs.length; i++) {
    pair = pairs[i];
    if(!pair) continue;

    pair = pair.split('=');
    if(decode(pair[0]) === key) return decode(pair[1] || '');
  }

  return null;
};


pie.browser.isRetina = function() {
  return window.devicePixelRatio > 1;
};


pie.browser.isTouchDevice = function() {
  return pie.object.has(window, 'ontouchstart') ||
    pie.object.instanceOf(document, 'DocumentTouch') ||
    navigator.MaxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;
};

pie.browser.testMediaQuery = function(query) {
  query = pie.browser.mediaQueries[query] || query;
  var matchMedia = window.matchMedia || window.msMatchMedia;
  if(matchMedia) return matchMedia(query).matches;
  return undefined;
};

pie.browser.orientation = function() {
  switch (window.orientation) {
  case 90:
  case -90:
    return 'landscape';
  default:
    return 'portrait';
  }
};

function needsGDPRCompliance(locale) {
  // GDPR only applies for EU countries
  return [
    'en-GB', 'de-DE', 'ca-ES', 'es-ES',
    'fr-FR', 'it-IT', 'pt-PT'
  ].includes(locale);
}

function cookieAllowedFromOneTrust(cookieName) {
  if(!needsGDPRCompliance(window.LOCALE)) { return true; }

  // We have some strictly necessary cookies, so we allow them regardless of consent
  var strictlyNecessaryCookies = [
    'CookieBannerHide', 'dismissed-intended-use-banner', 'ab', 'uid',
    'tr-ikea-data'
  ];
  if (strictlyNecessaryCookies.includes(cookieName) || cookieName.startsWith('alert-')) {
    return true;
  }

  // OneTrust sets a global variable that stores all consented categories
  if (window.OnetrustActiveGroups) {
    var newCookieGroupCode;

    // Performance Cookies C0002
    if (cookieName === 'trpromo' || cookieName === 'event_metadata') {
      newCookieGroupCode = 'C0002';
    }
    // Functional Cookies C0003
    else if (cookieName === 'client_width') {
      newCookieGroupCode = 'C0003';
    }
    // Targeting Cookies C0004
    else if (cookieName.startsWith('app-strt-rprtd-')) {
      newCookieGroupCode = 'C0004';
    } else if (cookieName.startsWith('app-dn-rprtd-')) {
      newCookieGroupCode = 'C0004';
    }

    if(newCookieGroupCode) {
      var allowedGroups = window.OnetrustActiveGroups.split(',');
      return allowedGroups.includes(newCookieGroupCode);
    }
  }

  // If OneTrust is not active/deployed, we deffer to block cookies
  return false;
}

pie.browser.setCookie = function(key, value, options) {
  if(cookieAllowedFromOneTrust(key)) {
    options = pie.object.merge({path: '/'}, options);

    /* jslint eqnull:true */
    if(value == null) options.expires = -1;

    if (pie.object.isNumber(options.expires)) {
      var days = options.expires;
      options.expires = new Date();
      options.expires.setDate(options.expires.getDate() + days);
    }

    value = String(value);

    document.cookie = [
      encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
      options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
      options.path    ? '; path=' + options.path : '',
      options.domain  ? '; domain=' + options.domain : '',
      options.secure  ? '; secure' : ''
    ].join('');
  }

  return document.cookie;
};
// takes a iso date string and converts to a local time representing 12:00am, on that date.
pie.date.dateFromISO = function(isoDateString) {
  if(!isoDateString) return null;
  var parts = isoDateString.split(/T|\s/)[0].split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};


// current timestamp
pie.date.now = function(secondsPlease) {
  var t = new Date().getTime();
  if(secondsPlease) t = parseInt(t / 1000, 10);
  return t;
};

/**
 * STOLEN FROM HERE:
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */

pie.date.timeFromISO = (function() {

  var numericKeys = [1, 4, 5, 6, 7, 10, 11];

  return function(date) {
    if(!date) return NaN;
    if(!/T|\s/.test(date)) return pie.date.dateFromISO(date);

    var timestamp, struct, minutesOffset = 0;

    // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
    // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
    // implementations could be faster
    //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
    if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
      // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
      for (var i = 0, k; (k = numericKeys[i]); ++i) {
        struct[k] = +struct[k] || 0;
      }

      // allow undefined days and months
      struct[2] = (+struct[2] || 1) - 1;
      struct[3] = +struct[3] || 1;

      if (struct[8] !== 'Z' && struct[9] !== undefined) {
        minutesOffset = struct[10] * 60 + struct[11];

        if (struct[9] === '+') {
          minutesOffset = 0 - minutesOffset;
        }
      }

      timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
    } else {
      timestamp = NaN;
    }

    return new Date(timestamp);
  };

})();
// # Pie DOM Utilities
// A series of helpful methods for working with DOM elements.

pie.dom._all = function(originalArgs, returnValues) {
  var nodes = pie.array.from(originalArgs[0]),
  meths = originalArgs[1].split('.'),
  args = Array.prototype.slice.call(originalArgs, 2),
  meth = meths[meths.length-1],
  assign = /=$/.test(meth),
  r, f, i, v;

  if(assign) meth = meth.substr(0,meth.length-1);
  if(returnValues) r = [];

  nodes.forEach(function(e){
    for(i=0;i < meths.length-1;i++) {
      f = e[meths[i]];
      e = pie.fn.valueFrom(f);
    }
    if(assign) v = e[meth] = args[0];
    else {
      f = e[meth];
      v = pie.fn.valueFrom(f, e, args);
    }

    if(returnValues) r.push(v);
  });

  return returnValues ? r : undefined;
};

// **pie.dom.all**
//
// Invokes the provided method or method chain with the provided arguments to all elements in the nodeList.
// `nodeList` can either be a node, nodeList, or an array of nodes.
// `methodName` can be a string representing a method name, an attribute, or a property. Can be chained with periods. Can end in a `=` to invoke an assignment.
// ```
// pie.dom.all(nodeList, 'setAttribute', 'foo', 'bar');
// pie.dom.all(nodeList, 'classList.add', 'active');
// pie.dom.all(nodeList, 'clicked=', true);
// ```
pie.dom.all = function(/* nodeList, methodName[, arg1, arg2, ...] */) {
  return pie.dom._all(arguments, false);
};


(function(){
  var mod = function(method, originalArgs) {
    var args = pie.array.from(originalArgs);
    var el = args.shift();
    var classes = pie.array.flatten(args).join(' ').split(/[\s,]+/);
    classes = pie.array.map(classes, 'trim', true);
    classes = pie.array.compact(classes, true);
    classes.forEach(function(c){ el.classList[method](c); });
  };

  pie.dom.addClass = function(/* el, class1, class2 */) {
    mod('add', arguments);
  };

  pie.dom.removeClass = function(/* el, class1, class2 */) {
    mod('remove', arguments);
  };
})();


pie.dom.attrs = function(el, setters, prefix) {
  prefix = prefix || '';

  if(setters) {
    pie.object.forEach(setters, function(k,v) {
      if(v == null) {
        el.removeAttribute(prefix + k);
      } else {
        el.setAttribute(prefix + k);
      }
    });
  }

  var out = {};

  pie.object.forEach(el.attributes, function(k,v) {
    if(!prefix || k.indexOf(prefix) === 0) {
      out[k.substr(prefix.length)] = v;
    }
  });

  return out;
};

// **pie.dom.closest**
//
// Retrieve the closest ancestor of `el` which matches the provided `sel`.
// ```
// var form = pie.dom.closest(input, 'form');
// form.submit();
// ```
pie.dom.closest = function(el, sel) {
  while((el = el.parentNode) && !pie.dom.isDocument(el)) {
    if(pie.dom.matches(el, sel)) return el;
  }
};

// **pie.dom.createElement**
//
// Create an element based on the string content provided.
// ```
// var el = pie.dom.createElement('<div class="foo"><strong>Hi</strong>, John</div>')
// el.innerHTML
// //=> "<strong>Hi</strong>, John"
// el.classList
// //=> ['foo']
// ```
pie.dom.createElement = function(str) {
  var wrap = document.createElement('div');
  wrap.innerHTML = str;
  return wrap.removeChild(wrap.firstElementChild);
};

// **pie.dom.cache**
//
// A cache created solely for caching element specific information,
// easier for cleanup via `pie.dom.remove()`.
pie.dom.cache = function() {
  pie.elementCache = pie.elementCache || pie.cache.create();
  return pie.elementCache;
};

pie.dom.data = function(el, setters) {
  return pie.dom.attrs(el, setters, 'data-');

};

// **pie.dom.getAll**
//
// Has the same method signature of `pie.dom.all` but returns the values of the result
// ```
// pie.dom.getAll(nodeList, 'clicked')
// //=> [true, true, false]
// ```
pie.dom.getAll = function() {
  return pie.dom._all(arguments, true);
};

// **pie.dom.isDocument**
//
// Determine whether the `el` is a document node.
pie.dom.isDocument = function(el) {
  return el && el.nodeType === el.DOCUMENT_NODE;
};

// **pie.dom.isWindow**
//
// Determine whether the provided `el` is the `window`.
pie.dom.isWindow = function(el) {
  return el === window;
};

// **pie.dom.matches**
//
// Test whether an element matches a given selector.
// ```
// pie.dom.matches(form, 'input');
// //=> false
// pie.dom.matches(form, 'form');
// //=> true
// ```
pie.dom.matches = function(el, sel) {
  if(pie.object.isDom(sel)) return el === sel;

  var fn = pie.dom.prefixed(el, 'matches');
  if(fn) return fn(sel);

  fn = pie.dom.prefixed(el, 'matchesSelector');
  if(fn) return fn(sel);

  var parent = el.parentNode || el.document;
  if(!parent || !parent.querySelector) return false;

  pie.uid(el);
  el.setAttribute('data-pie-id', pie.uid(el));

  sel += '[data-pie-id="' + pie.uid(el) + '"]';
  return parent.querySelector(sel) === el;
};

// **pie.dom.off**
//
// Remove an observer from an element. The more information provided the more tests will be run to determine
// whether the observer is a match. Support of namespaces are the same as `pie.dom.on`, however, in the case
// of `off`, `"*"` can be provided to remove all events within a namespace.
// ```
// pie.dom.off(document.body, 'click');
// pie.dom.off(document.body', 'click.fooNs');
// pie.dom.off(document.body', '*.fooNs');
// ```

pie.dom.off = function(el, event, fn, selector, cap) {
  var eventSplit = event.split('.'),
    namespace, all, events, compactNeeded;

  pie.uid(el);
  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  all = event === '*';

  events = pie.dom.cache().getOrSet('element-' + pie.uid(el) + '.dom-events', {});

  (all ? Object.keys(events) : [event]).forEach(function(k) {
    compactNeeded = false;

    pie.array.from(events[k]).forEach(function(obj, i, ary) {
      if(cap == null && (k === 'focus' || k === 'blur') && obj.sel) cap = true;
      if((namespace == null || namespace === obj.ns) &&
          (fn == null || fn === obj.fn) &&
          (selector == null || selector === obj.sel) &&
          (cap === obj.cap)) {
        el.removeEventListener(k, obj.cb, obj.cap);
        delete ary[i];
        compactNeeded = true;
      }
    });

    if(compactNeeded) events[k] = pie.array.compact(events[k]);

  });
};

// **pie.dom.on**
//
// Observe an event on a particular `el`.
// ```
// var handler = function(e){
//   var btn = e.delegateTarget;
//   btn.classList.toggle('is-loading');
// }
// pie.dom.on(pie.qs('.btn'), 'click', handler);
// // => all events on the first .btn will be observed.
// ```
// Optionally, the event can be filtered by a `selector`.
// If a selector is provided, a `delegateTarget` which represents the
// matching target as defined by `selector` will be placed
// on the event. The event is then provided to `fn`.
//
// ```
// pie.dom.on(document.body, 'click', handler, '.btn');
// //=> all events that bubble to document.body and pass through or
// //=> originate from a .btn, will be observed.
// ```
pie.dom.on = function(el, event, fn, selector, capture) {
  var eventSplit = event.split('.'),
      cb, namespace, events;

  event = eventSplit.shift();
  namespace = eventSplit.join('.');
  pie.uid(el);

  // we force capture so that delegation works.
  if(!capture && (event === 'focus' || event === 'blur') && selector) capture = true;

  events = pie.dom.cache().getOrSet('element-' + pie.uid(el)  + '.dom-events', {});
  events[event] = events[event] || [];

  cb = function(e) {
    var targ, qel;

    if(namespace) {
      e.namespace = namespace;
    }

    if(!selector) {
      fn.call(el, e);
    } else {
      // if the target matches the selector, it is the delegateTarget.
      targ = pie.dom.matches(e.target, selector) ? e.target : null;

      // othwerwise, try to find a parent that is a child of el which matches the selector.
      if(!targ) {
        qel = pie.dom.closest(e.target, selector);
        if(qel && el.contains(qel)) targ = qel;
      }

      if(targ) {
        e.delegateTarget = targ;
        fn.call(targ, e);
      }
    }
  };

  events[event].push({
    ns: namespace,
    sel: selector,
    cb: cb,
    fn: fn,
    cap: capture
  });

  el.addEventListener(event, cb, capture);
  return cb;
};

// **pie.dom.parseForm**
//
// Given a form element `el` parse the names & values from it.
// Optionally, the fields to parse can be filtered by providing a list of names.
//
// Given the markup:
// ```
// <form>
//   <input name="fullName" />
//   <input name="email" />
//   <select name="interest">...</select>
// </form>
// ```
// We can retrieve the fields using `parseForm`.
// ```
// pie.dom.parseForm(form)
// //=> {fullName: 'foo', email: 'foo@bar.com', interest: 'user'}
// pie.dom.parseForm(form, 'fullName')
// //=> {fullName: 'foo'}
// ```
pie.dom.parseForm = function(/* el, *fields */) {
  var args = pie.array.from(arguments),
  form = args.shift(),
  names = pie.array.flatten(args),
  inputs = form.querySelectorAll('input[name], select[name], textarea[name]'),
  o = {},
  origLength;

  inputs = pie.array.groupBy(inputs, 'name');

  pie.object.forEach(inputs, function(name,fields) {
    if(names.length && names.indexOf(name) < 0) return;

    origLength = fields.length;

    if(fields[0].type === 'radio') {
      origLength = 1;
      fields = fields.filter(function(f){ return f.checked; });
    } else {
      fields = fields.filter(function(f){ return f.type === 'checkbox' ? f.checked : true; });
    }


    if(origLength > 1) o[name] = pie.array.map(fields, 'value');
    else o[name] = fields[0] && fields[0].value;
  });

  return o;
};

// **pie.dom.prependChild**
//
// Insert a child at the top of the parent.
// ```
// // el = <div><p>Things</p></div>
// // child = <h3>Title</h3>
// pie.dom.prependChild(el, child)
// // el = <div><h3>Title</h3><p>Things</p></div>
// ```
pie.dom.prependChild = function(el, child) {
  el.insertBefore(child, el.firstChild);
};

// **pie.dom.remove**
//
// Remove `el` from the dom, clearing any cache we've constructed.
// If you intend on adding the element back into the dom you should
// remove `el` manually, not via `pie.dom.remove`.
//
// ```
// pie.dom.remove(el)
// // => el.parentNode == null;
// ```
pie.dom.remove = function(el) {
  pie.uid(el);
  pie.dom.cache().set('element-' + pie.uid(el), undefined);
  if(el.parentNode) el.parentNode.removeChild(el);
};

// **pie.dom.scrollParents**
//
// Find all the parent elements of `el` that have a scroll property.
// Useful for spying on scroll and determing element position.
// Optionally, you can provide the following options:
//  * direction = 'x' or 'y', defaults to null (both)
//  * includeSelf - if `true` it will evaluate `el`'s scroll property and include it in the parent list.
//  * closest - if `true` it will return the first scroll parent instead of all of them.
//
// ```
// pie.dom.scrollParents(el)
// //=> document.body
// ```
// **Note** window will not be included in the response.
pie.dom.scrollParents = (function(){
  var regex = /scroll|auto/,
  prop = function(el, dir) {
    var style = getComputedStyle(el),
    flow = style.getPropertyValue('overflow');
    if(!dir || dir === 'x') flow += style.getPropertyValue('overflow-x');
    if(!dir || dir === 'y') flow += style.getPropertyValue('overflow-y');
    return flow;
  };

  return function(el, options) {
    var parents = options && options.closest ? undefined : [],
    style;

    if(!options || !options.includeSelf) el = el.parentNode;

    while(el && !pie.dom.isDocument(el)) {
      style = prop(el, options && options.direction);

      if(regex.test(style)) {
        if(options && options.closest) return el;
        parents.unshift(el);
      }

      el = el.parentNode;
    }

    return parents;
  };
})();

// **pie.dom.scrollTo**
//
// Scroll the page to `sel`.
// If `sel` is a string it will find the first occurrence via a querySelector within the provided container.
// If `sel` is a dom node, the nodes position will be used.
// If `sel` is a number, it will scroll to that position.
// Available options:
//  * container - the container to scroll, defaults to document.body
//  * cb - the callback to invoke when scrolling is finished.
//  * onlyUp - only scrolls if the element is above the current position.
//  * onlyDown - only scrolls if the element is below the current position.
//  * gravity - where the element should appear in the viewport,
//  * * - any option available in pie.fn.ease
//
// ```
// pie.dom.scrollTo('header', {onlyUp: true, cb: fn, name: 'easeInQuart'});
pie.dom.scrollTo = function(sel, options) {
  var position = 0,
  container = options && options.container || pie.dom.rootScrollElement(),
  cb = options && options.cb,
  gravity = options && options.gravity || 'top',
  quit = false;

  if(pie.object.isNumber(sel)) {
    position = sel;
  } else if(pie.object.isString(sel)) {
    sel = container.querySelector(sel);
  }

  if(sel) {
    // ep is the elements position on the page.
    var ep = pie.dom.position(sel, container),
    // cp is the containers position on the page.
    cp = pie.dom.position(container);

    if(gravity === 'center') {
      position = (ep.top + (ep.height / 2)) - (cp.height / 2);
    } else if(gravity === 'bottom') {
      position = (ep.bottom - cp.height);
    } else { // top
      position = ep.top;
    }
  }

  if(options) {
    if(options.onlyUp && container.scrollTop <= position) quit = true;
    if(options.onlyDown && container.scrollTop >= position) quit = true;
  }

  if(position === container.scrollTop) quit = true;

  if(quit) {
    if(cb) cb();
    return;
  }

  options = pie.object.merge({
    from: container.scrollTop,
    to: position,
    name: 'easeInOutCubic',
    duration: 250,
    animation: true
  }, options);

  delete options.cb;
  delete options.container;
  delete options.onlyUp;
  delete options.onlyDown;
  delete options.gravity;

  pie.fn.ease(function(p){
    container.scrollTop = p;
  }, options, cb);

};

// **pie.dom.rootScrollElement**
//
// Returns either the html or body element depending on which one
// is in charge of scrolling the page. If no determination can be
// made the html element is returned since that's what the spec
// states is correct.
//
// This is why you'll often see $('body, html').animate() in jquery apps.
pie.dom.rootScrollElement = function() {
  var body = document.body,
  html = document.documentElement;

  if(body.scrollTop) return body;
  if(html.scrollTop) return html;

  var correct;
  // both are zero, so try to change it by 1
  body.scrollTop = html.scrollTop = 1;
  if(body.scrollTop) correct = body;
  else correct = html;

  body.scrollTop = html.scrollTop = 1;
  return correct;
};


// **pie.dom.trigger**
//
// Trigger an event `e` on `el`.
// If the event is a click, it will invoke the click() handler instead of creating
// a dom event. This is for browser compatability reasons (certain versions of FF).
// If you want to force an event, pass true as the third argument.
//
// ```
// pie.dom.trigger(el, 'click');
// pie.dom.trigger(el, 'foo.bar');
// ```
//
pie.dom.trigger = function(el, e, forceEvent) {

  if(!forceEvent && e === 'click') return el.click();

  var event = document.createEvent('Event');
  event.initEvent(e, true, true);
  return el.dispatchEvent(event);
};

// **pie.dom.prefixed**
//
// Find the first available version of the desired function, including browser specific implementations.
// ```
// pie.dom.prefixed(el, 'matches');
// pie.dom.prefixed(el, 'matchesSelector');
// pie.dom.prefixed(getComputedStyle(document.body), 'animation-delay')
// ```
pie.dom.prefixed = (function(){
  var prefixes = ['', 'webkit', 'moz', 'ms', 'o'],
  returnVal = function(val, el, standard){
    pie.dom.cache().set('browserPrefix.' + standard, val);
    return pie.object.isFunction(val) ? val.bind(el) : val;
  };

  return function(el, standardName) {

    var cacheHit = pie.dom.cache().get('browserPrefix.' + standardName);
    if(cacheHit) return returnVal(cacheHit, el, standardName);

    var prefix, i = 0,
    capd = pie.string.capitalize(standardName);

    for(; i < prefixes.length; i++) {
      prefix = prefixes[i];

      if(el[prefix + standardName]) return returnVal(el[prefix + standardName], el, standardName);
      if(el['-' + prefix + '-' + standardName]) return returnVal(el['-' + prefix + '-' + standardName], el, standardName);
      if(el[prefix + capd]) return returnVal(el[prefix + capd], el, standardName);
    }
  };
})();

pie.dom.viewportPosition = function() {
  var windowW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
  windowH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return {
    top: window.scrollY,
    bottom: window.scrollY + windowH,
    height: windowH,
    left: window.scrollX,
    right: window.scrollX + windowW,
    width: windowW
  };
};

pie.dom.position = function(el, container) {

  if(pie.dom.isWindow(el)) return pie.dom.viewportPosition(el);

  var   top = 0,
  left = 0,
  w = el.offsetWidth,
  h = el.offsetHeight;

  container = container || document.body;

  while(el && el !== container) {
    top += (el.offsetTop - el.scrollTop);
    left += (el.offsetLeft - el.scrollLeft);
    el = el.offsetParent;
  }

  return {
    width: w,
    height: h,
    top: top,
    left: left,
    right: left + w,
    bottom: top + h
  };
};

pie.dom.inViewport = function(el, threshold, vLoc) {
  var viewportLoc = vLoc || pie.dom.viewportPosition(),
  t = threshold || 0,
  elLoc = pie.dom.position(el);

  return  elLoc.bottom >= viewportLoc.top - t &&
          elLoc.top <= viewportLoc.bottom + t &&
          elLoc.right >= viewportLoc.left - t &&
          elLoc.left <= viewportLoc.right + t;
};
// **pie.fn.async**
//
// Invoke all `fns` and when they have completed their execution, invoke the callback `cb`.
// Each provided function is expected to invoke a callback supplied as it's first argument.
// ```
// var a = function(cb){ console.log('hey'); cb(); };
// var b = function(cb){ app.ajax.get(...).complete(cb); };
// var complete = function(){ console.log('complete!'); };
//
// pie.fn.async([a, b], complete);
// //=> "hey" is logged, ajax is completed, then "complete!" is logged.
// ```

pie.fn.async = function(fns, cb, counterObserver) {

  if(!fns.length) {
    cb();
    return;
  }

  var completeCount = fns.length,
  completed = 0,
  counter = function fnAsyncCounter() {
    if(counterObserver) counterObserver.apply(null, arguments);
    if(++completed === completeCount) {
      if(cb) cb();
    }
  };

  fns.forEach(function fnAsyncIterator(fn) { fn(counter); });
};

// **pie.fn.debounce**
//
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// Lifted from underscore.js
// ```
// pie.fn.debounce(submitForm, 500);
// ```
pie.fn.debounce = function(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = pie.date.now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = pie.date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

// **pie.fn.delay**
//
// Delay an invocation until some time has passed. Once that time has passed, any invocation will occur immediately.
// Invocations 2-N that occur before the delay period are ignored.
// ```
// fn = pie.fn.delay(fn, 250)
// fn(); // doesn't happen but is scheduled for 250ms from now.
// // 249ms passes
// fn(); // doesn't happen, not scheduled either.
// // 1ms passes
// // one invocation is triggered.
// // N ms passes
// fn(); // happens immediately
// ```
pie.fn.delay = function(fn, delay) {
  if(!delay) return fn;

  var threshold = pie.date.now() + delay;
  var scheduled = false;

  return function() {
    var now = pie.date.now();
    if(now < threshold) {
      if(!scheduled) {
        scheduled = true;
        setTimeout(fn, threshold - now);
      }
    } else {
      fn();
    }
  };
};


// **pie.fn.ease**
//
// Invoke a callback `cb` with the coordinates of an easing function.
// The callback will receive the `y` & `t` values where t ranges from 0 to 1 and `y` ranges
// from the `from` and to the `to` options. The easing function can be described by passing
// a name option which coincides with the easing functions defined in `pie.math`.
// ```
// pie.fn.ease(function(y, t){
//   window.scrollTo(0, y);
// }, { from: 0, to: 300, name: 'easeOutCubic' });
// ```
pie.fn.ease = function(each, o, complete) {
  o = pie.object.merge({
    name: 'linear',
    duration: 250,
    from: 0,
    to: 1,
    delay: 0,
    animation: false
  }, o);

  if(o.name === 'none') {
    each(o.to, 1);
    if(complete) complete();
    return;
  }

  var via = o.animation ? pie.fn._easeAnimation : pie.fn._easeInterval,
  start = function(){ via(each, o, complete); };

  if(o.delay) start = pie.fn.delay(start, o.delay);

  start();
};

/* ease using an interval (non-ui stuff) */
pie.fn._easeInterval = function(each, o, complete) {
  o.steps = o.steps || Math.max(o.duration / 16, 12);

  /* the easing function */
  var fn = pie.math.easing[o.name],
  /* the current "time" 0 to 1. */
  t = 0,
  delta = (o.to - o.from),
  dt = (1 / o.steps),
  dy,
  y,
  pid,
  runner = function easeIntervalRunner(){
    dy = fn(t);
    y = o.from + (dy * delta);
    each(y, t);
    if(t >= 1) {
      t = 1;
      clearInterval(pid);
      if(complete) complete();
    } else t += dt;
    // return ourself so we can invoke as part of setInterval
    return runner;
  };

  pid = setInterval(runner(), o.duration / o.steps);
  return pid;
};

/* ease using the animation frame (ui stuff) */
pie.fn._easeAnimation = function(each, o, complete) {

  var animate = pie.dom.prefixed(window, 'requestAnimationFrame');

  // just in case the browser doesn't support the animation frame.
  if(!animate) return pie.fn._easeInterval(each, o, complete);

  /* the easing function */
  var fn = pie.math.easing[o.name],
  // the current "time" 0 to 1.
  x = 0,
  startT,
  endT,
  delta = (o.to - o.from),
  dy,
  y,
  runner = function easeAnimationRunner(bigT){

    if(!startT) {
      startT = bigT;
      endT = startT + o.duration;
    }

    x = (bigT - startT) / (endT - startT);
    dy = fn(x);
    y = o.from + (dy * delta);
    each(y, x);

    if(bigT >= endT) {
      if(y !== o.to) each(o.to, 1);
      if(complete) complete();
    } else {
      animate(runner);
    }
  };

  animate(runner);
};

// **pie.fn.once**
//
// Only ever invoke the function `f` once. The return value will always be the same.
// ```
// var count = 0;

// var f = pie.fn.once(function(){
//   count++;
//   return count;
// });
//
// f();
// //=> 1
// f();
// //=> 1
// ```
pie.fn.once = function(f) {
  var called = false,
  result;

  return function() {

    if(!called) {
      called = true;
      result = f.apply(null, arguments);
    }

    return result;
  };
};

pie.fn.noop = function(){};

// **pie.fn.throttle**
//
// Trigger an event no more than the specified rate.
// Note that the functions do not pile up and continue executing,
// they only execute at the rate specified while still being invoked.
//
// ```
// fn = pie.fn.throttle(fn, 250);
// fn(); fn();
// //=> fires once
// ```
pie.fn.throttle = function(fn, threshold, scope) {
  threshold = threshold || 250;
  var last, deferTimer;

  return function () {
    var context = scope || this;

    var now = pie.date.now(),
        args = arguments;

    if (last && now < last + threshold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};


// **pie.fn.valueFrom**
//
// If a function is provided, it will be invoked otherwise the provided value will be returned.
// ```
// pie.fn.valueFrom(4)
// //=> 4
// pie.fn.valueFrom(function(){ return 5; });
// //=> 5
// pie.fn.valueFrom(function(){ return Object.keys(this); }, {'foo' : 'bar'});
// //=> ["foo"];
// pie.fn.valueFrom(function(o){ return Object.keys(o); }, null, {'foo' : 'bar'});
// //=> ["foo"];
// ```
pie.fn.valueFrom = function(f, binding, args) {
  if(pie.object.isFunction(f)) return f.apply(binding, args) ;
  return f;
};

pie.fn.from = function(fn, obj) {
  if(pie.object.isString(fn) && obj) return obj[fn].bind(obj);
  return fn;
};
pie.math.precision = function(number, places) {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
};

pie.math.easing = {
  // no easing, no acceleration
  linear: function (t) { return t; },
  // just get us to the end.
  none: function(/* t */){ return 1; },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t; },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t); },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
  // accelerating from zero velocity
  easeInCubic: function (t) { return t*t*t; },
  // decelerating to zero velocity
  easeOutCubic: function (t) { return (--t)*t*t+1; },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
  // accelerating from zero velocity
  easeInQuart: function (t) { return t*t*t*t; },
  // decelerating to zero velocity
  easeOutQuart: function (t) { return 1-(--t)*t*t*t; },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t; },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t; },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
};
// deletes all undefined and null values.
// returns a new object less any empty key/values.
pie.object.compact = function(a, removeEmpty){
  var b = pie.object.merge({}, a);
  Object.keys(b).forEach(function(k) {
    /* jslint eqnull:true */
    if(b[k] == null || (removeEmpty && b[k].toString().length === 0)) delete b[k];
  });
  return b;
};


// deep merge. Does not preserve identity of inner objects.
pie.object.deepMerge = function() {
  var args = pie.array.from(arguments),
      targ = args.shift(),
      obj;

  function fn(k) {

    if(pie.object.has(targ, k) && pie.object.isPlainObject(targ[k])) {
      targ[k] = pie.object.deepMerge({}, targ[k], obj[k]);
    } else if(pie.object.isPlainObject(obj[k])) {
      targ[k] = pie.object.deepMerge({}, obj[k]);
    } else {
      targ[k] = obj[k];
    }
  }

  // iterate over each passed in obj remaining
  for (; args.length;) {
    obj = args.shift();
    if(obj) Object.keys(obj).forEach(fn);
  }
  return targ;
};


// delete a path,
pie.object.deletePath = function(obj, path, propagate) {

  if(!~path.indexOf('.')) {
    delete obj[path];
  }

  var steps = pie.string.pathSteps(path), attr, subObj;

  while(steps.length) {
    attr = pie.array.last(steps.shift().split('.'));
    subObj = pie.object.getPath(obj, steps[0]);
    if(!subObj) return;
    delete subObj[attr];
    if(!propagate || !pie.object.isEmpty(subObj)) return;
  }

};

pie.object.dup = function(obj, deep) {
  return pie.object[deep ? 'deepMerge' : 'merge']({}, obj);
};

pie.object.eq = function(a, b, strict) {
  var i;

  /* jslint eqeq:true */
  if(Array.isArray(a) && Array.isArray(b)) {
    if(a.length !== b.length) return false;
    for(i = 0; i < a.length; i++) {
      if(!pie.object.eq(a[i], b[i], strict)) return false;
    }
    return true;
  }

  if(pie.object.isObject(a) && pie.object.isObject(b)) {
    var aKeys = Object.keys(a).sort(), bKeys = Object.keys(b).sort();

    if(!pie.object.eq(aKeys, bKeys, strict)) return false;
    for(i = 0; i < aKeys.length; i++) {
      if(!pie.object.eq(a[aKeys[i]], b[aKeys[i]], strict)) return false;
    }

    return true;
  }

  return strict ? a === b : a == b;
};

// grab the sub-object from the provided object less the provided keys.
// pie.object.except({foo: 'bar', biz: 'baz'}, 'biz') => {'foo': 'bar'}
pie.object.except = function(){
  var keys = pie.array.from(arguments),
  a = keys.shift(),
  b = {};

  keys = pie.array.flatten(keys);

  Object.keys(a).forEach(function(k){
    if(keys.indexOf(k) < 0) b[k] = a[k];
  });

  return b;
};

pie.object.expand = function(o) {
  var out = {};
  pie.object.forEach(o, function(k, v){
    pie.object.setPath(out, k, v);
  });
  return out;
};

pie.object.flatten = function(a, prefix, object) {
  var b = object || {};
  prefix = prefix || '';

  pie.object.forEach(a, function(k,v) {
    if(pie.object.isPlainObject(v) && !pie.object.isEmpty(v)) {
      pie.object.flatten(v, prefix + k + '.', b);
    } else {
      b[prefix + k] = v;
    }
  });

  return b;
};

pie.object.prefix = function(a, prefix) {
  var b = {};
  pie.object.forEach(a, function(k,v) {
    b[prefix + k] = v;
  });
  return b;
};

pie.object.isWindow = function(obj) {
  return obj && typeof obj === "object" && "setInterval" in obj;
};

pie.object.isEmpty = function(obj) {
  if(!obj) return true;
  var k;
  /* jshint forin:false */
  for(k in obj) { return false; }
  return true;
};


/* From jQuery */
pie.object.isPlainObject = function(obj) {

  if ( !obj || !pie.object.isObject(obj) || obj.nodeType || pie.object.isWindow(obj) || obj.__notPlain || obj.__pieRole ) {
    return false;
  }

  if ( obj.constructor &&
    !pie.object.has(obj, "constructor") &&
    !pie.object.has(obj.constructor.prototype, "isPrototypeOf") ) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for ( key in obj ) {}
  return key === undefined || pie.object.has(obj, key);
};

['Object', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Boolean'].forEach(function(name) {
  pie.object['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
});

(function(){
  if(!pie.object.isArguments(arguments)) {
    pie.object.isArguments = function(obj) {
      return obj && obj.hasOwnProperty('callee');
    };
  }
})();

pie.object.isUndefined = function(obj) {
  return obj === void 0;
};

pie.object.isNode = function(obj) {
  return obj instanceof Node;
};

pie.object.isDom = function(obj) {
  return pie.object.isNode(obj) || pie.object.isWindow(obj);
};

pie.object.isModel = function(obj) {
  return obj && obj.__pieRole === 'model';
};

pie.object.isView = function(obj) {
  return obj && obj.__pieRole === 'view';
};

pie.object.isPromise = function(obj) {
  return obj && obj.__pieRole === 'promise';
};

pie.object.isApp = function(obj) {
  return obj && obj.__pieRole === 'app';
};

(function() {
  var regex = /^is(.+)/;

  Object.keys(pie.object).forEach(function(k) {
    var match = k.match(regex);
    if(match) {
      pie.object['isNot' + match[1]] = function() {
        return !pie.object['is' + match[1]];
      };
    }
  });

})();

// shallow merge
pie.object.merge = function() {
  var args = pie.array.from(arguments),
      targ = args.shift() || {},
      obj;

  function fn(k) {
    targ[k] = obj[k];
  }

  // iterate over each passed in obj remaining
  for (; args.length; ) {
    obj = args.shift();
    if(obj) Object.keys(obj).forEach(fn);
  }

  return targ;
};


// yield each key value pair to a function
// pie.object.forEach({'foo' : 'bar'}, function(k,v){ console.log(k, v); });
//
// => foo, bar
pie.object.forEach = function(o, f) {
  if(!o) return;

  Object.keys(o).forEach(function(k) {
    f(k, o[k]);
  });
};


pie.object.getPath = function(obj, path) {
  if(!path) return obj;
  if(!~path.indexOf('.')) return obj[path];

  var p = path.split('.'), key;
  while(p.length) {
    if(!obj) return obj;
    key = p.shift();
    if (!p.length) return obj[key];
    else obj = obj[key];
  }
  return obj;
};


pie.object.getValue = function(o, attribute) {
  if(pie.object.isFunction(attribute))          return attribute.call(null, o);
  else if (o == null)                           return void 0;
  else if(pie.object.isFunction(o[attribute]))  return o[attribute].call(o);
  else if(pie.object.has(o, attribute, true))   return o[attribute];
  else                                          return void 0;
};

pie.object.has = function(obj, key, includeInherited) {
  return obj && (obj.hasOwnProperty(key) || (includeInherited && (key in obj)));
};

pie.object.hasAny = function(/* obj, *keys */) {
  var obj = arguments[0], checks;
  if(!obj) return false;

  if(arguments.length === 1) return !pie.object.isEmpty(obj);

  checks = pie.array.flatten(pie.array.get(arguments, 1, -1));
  for(var i=0;i<checks.length;i++) {
    if(pie.object.has(obj, checks[i])) return true;
  }

  return false;
};


// does the object have the described path
pie.object.hasPath = function(obj, path) {
  if(!~path.indexOf('.')) return pie.object.has(obj, path);

  var parts = path.split('.'), part;
  while(part = parts.shift()) {

    /* jslint eqeq:true */
    if(pie.object.has(obj, part)) {
      obj = obj[part];
    } else {
      return false;
    }
  }

  return true;
};

pie.object.instanceOf = function(instance, nameOfClass) {
  var klass = pie.object.getPath(window, nameOfClass);
  return klass && instance instanceof klass;
};

pie.object.reopen = (function(){

  var fnTest = /xyz/.test(function(){ "xyz"; });
  fnTest = fnTest ? /\b_super\b/ : /.*/;

  var wrap = function (newF, oldF) {
    /* jslint eqnull:true */

    // if we're not defining anything new, return the old definition.
    if(newF == null) return oldF;
    // if there is no old definition
    if(oldF == null) return newF;
    // if we're not overriding with a function
    if(!pie.object.isFunction(newF)) return newF;
    // if we're not overriding a function
    if(!pie.object.isFunction(oldF)) return newF;
    // if it doesn't call _super, don't bother wrapping.
    if(!fnTest.test(newF)) return newF;

    if(oldF === newF) return newF;

    return function superWrapper() {
      var ret, sup = this._super;
      this._super = oldF;
      ret = newF.apply(this, arguments);
      if(!sup) delete this._super;
      else this._super = sup;
      return ret;
    };
  };

  return function(/* target, *extensions */) {
    var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact', 'unique'),
    target = extensions.shift(),
    extender = function(k,fn) {
      target[k] = wrap(fn, target[k]);
    }.bind(this);

    extensions.forEach(function(e) {
      pie.object.forEach(e, extender);
    }.bind(this));

    return target;
  };
})();

pie.object.reverseMerge = function(/* args */) {
  var args = pie.array.from(arguments);
  args.reverse();
  return pie.object.merge.apply(null, args);
};

// serialize object into query string
// {foo: 'bar'} => foo=bar
// {foo: {inner: 'bar'}} => foo[inner]=bar
// {foo: [3]} => foo[]=3
// {foo: [{inner: 'bar'}]} => foo[][inner]=bar
pie.object.serialize = function(obj, removeEmpty) {
  var s = [], append, appendEmpty, build, rbracket = /\[\]$/;

  append = function(k,v){
    v = pie.fn.valueFrom(v);
    if(removeEmpty && !rbracket.test(k) && (v == null || !v.toString().length)) return;
    s.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
  };

  appendEmpty = function(k) {
    s.push(encodeURIComponent(k) + '=');
  };

  build = function(prefix, o, append) {
    if(Array.isArray(o)) {
      o.forEach(function(v) {
        build(prefix + '[]', v, append);
      });
    } else if(pie.object.isPlainObject(o)) {
      Object.keys(o).sort().forEach(function(k){
        build(prefix + '[' + k + ']', o[k], append);
      });
    } else {
      append(prefix, o);
    }
  };

  Object.keys(obj).sort().forEach(function(k) {
    build(k, obj[k], append);
  });

  return s.join('&');
};


pie.object.setPath = function(obj, path, value) {
  if(!~path.indexOf('.')) return obj[path] = value;

  var p = path.split('.'), key;
  while(p.length) {
    key = p.shift();
    if (!p.length) return obj[key] = value;
    else if (obj[key]) obj = obj[key];
    else obj = obj[key] = {};
  }
};


// grab a sub-object from the provided object.
// pie.object.slice({foo: 'bar', biz: 'baz'}, 'biz') => {'biz': 'baz'}
pie.object.slice = function() {
  var keys = pie.array.from(arguments),
  a = keys.shift(),
  b = {};

  keys = pie.array.flatten(keys);
  keys.forEach(function(k){
    if(pie.object.has(a, k)) b[k] = a[k];
  });

  return b;
};

// return all the values of the object
pie.object.values = function(a) {
  return Object.keys(a).map(function(k) { return a[k]; });
};
pie.string.PROTOCOL_TEST = /\w+:\/\//;

pie.string.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};


pie.string.change = function() {
  var args = pie.array.from(arguments),
  str = args.shift();
  args.forEach(function(m) {
    str = pie.string[m](str);
  });

  return str;
};


// deserialize query string into object
pie.string.deserialize = (function(){

  function parseQueryValue(value) {
    if(value === 'undefined') return undefined;
    if(value === 'null') return null;
    if(value === 'true') return true;
    if(value === 'false') return false;
    if(/^-?\d*(\.\d+)?$/.test(value)) {
      var f = parseFloat(value, 10),
          i = parseInt(f, 10);
      if(!isNaN(f) && f % 1) return f;
      if(!isNaN(i)) return i;
    }
    return value;
  }

  // foo[][0][thing]=bar
  // => [{'0' : {thing: 'bar'}}]
  // foo[]=thing&foo[]=bar
  // => {foo: [thing, bar]}
  function applyValue(key, value, params) {
    var pieces = key.split('['),
    segmentRegex = /^\[(.+)?\]$/,
    match, piece, target;

    key = pieces.shift();
    pieces = pieces.map(function(p){ return '[' + p; });

    target = params;

    while(piece = pieces.shift()) {
      match = piece.match(segmentRegex);
      // obj
      if(match[1]) {
        target[key] = target[key] || {};
        target = target[key];
        key = match[1];
      // array
      } else {
        target[key] = target[key] || [];
        target = target[key];
        key = target.length;
      }
    }

    target[key] = value;

    return params;
  }

  return function(str, parse) {
    var params = {}, idx, pieces, segments, key, value;

    if(!str) return params;

    idx = str.indexOf('?');
    if(~idx) str = str.slice(idx+1);

    pieces = str.split('&');
    pieces.forEach(function(piece){
      segments = piece.split('=');
      key = decodeURIComponent(segments[0] || '');
      value = decodeURIComponent((segments[1] || '').replace(/\+/g, '%20'));

      if(parse) value = parseQueryValue(value);

      applyValue(key, value, params);
    });

    return params;
  };
})();

pie.string.downcase = function(str) {
  return str.toLowerCase();
};


pie.string.escapeRegex = function(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Escapes a string for HTML interpolation
pie.string.escapeHtml = (function(){
  var encMap = {
    "<"   : "&lt;",
    ">"   : "&gt;",
    "&"   : "&amp;",
    "\""  : "&quot;",
    "'"   : "&#39;"
  };
  var encReg = new RegExp("[" + pie.string.escapeRegex(Object.keys(encMap).join('')) + "]", 'g');
  var replacer = function(c){
    return encMap[c] || "";
  };

  return function(str) {
    /* jslint eqnull: true */
    if(str == null) return str;
    return ("" + str).replace(encReg, replacer);
  };
})();

pie.string.endsWith = function(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

pie.string.startsWith = function(str, prefix) {
  return str.indexOf(prefix) === 0;
};

// designed to be used with the "%{expression}" placeholders
pie.string.expand = function(str, data, raiseOnMiss) {
  data = data || {};
  return str.replace(/\%\{(.+?)\}/g, function(match, key) {
    if(raiseOnMiss && !pie.object.has(data, key)) throw new Error("Missing interpolation argument `" + key + "` for '" + str + "'");
    return data[key];
  });
};


pie.string.humanize = function(str) {
  return str.replace(/_id$/, '').replace(/([a-z][A-Z]|[a-z]_[a-z])/g, function(match, a){ return a[0] + ' ' + a[a.length-1]; });
};


pie.string.lowerize = function(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

pie.string.matches = function(str, regex) {
  var flags = "g";
  if(regex.ignoreCase) flags += "i";
  if(regex.multiline) flags += "m";

  regex = new RegExp(regex.source, flags);

  var matches = [], match = regex.exec(str);
  while (match != null) {
    matches.push(match[1]);
    match = regex.exec(str);
  }
  return matches;
};

pie.string.modularize = function(str) {
  return str.replace(/([^_])_([^_])/g, function(match, a, b){ return a + b.toUpperCase(); });
};

pie.string.normalizeUrl =  function(path) {

  // ensure there's a leading slash
  if(!pie.string.PROTOCOL_TEST.test(path) && path.charAt(0) !== '/') {
    path = '/' + path;
  }

  // normalize the path portion of a url if a query is present
  if(path.indexOf('?') > 0) {
    var split = path.split('?');
    path = pie.string.normalizeUrl(split.shift());
    split.unshift(path);
    path = split.join('?');
  }

  // remove any double slashes
  path = path.replace(/(^|[^:])\/\//g, "$1/");

  // remove trailing hashtags
  if(path.charAt(path.length - 1) === '#') {
    path = path.substr(0, path.length - 1);
  }

  // remove trailing question marks
  if(path.charAt(path.length - 1) === '?') {
    path = path.substr(0, path.length - 1);
  }

  // remove trailing slashes
  if(path.length > 1 && path.charAt(path.length - 1) === '/') {
    path = path.substr(0, path.length - 1);
  }

  return path;
};

pie.string.pluralize = function(str, count) {
  if(count === 1) return str;
  if(/ss$/i.test(str)) return str + 'es';
  if(/s$/i.test(str)) return str;
  if(/[a-z]$/i.test(str)) return str + 's';
  return str;
};

// todo: i18n
pie.string.possessive = function(str) {
  if(/s$/i.test(str)) return str + "'";
  return str + "'s";
};


pie.string.setTemplateSettings = function(begin, end, escape, interp, evalr, splitter) {
  splitter = splitter || '~~pie-interp~~';
  escape = escape || '-';
  interp = interp || '=';
  evalr = evalr || '';

  var escapedBegin = pie.string.escapeRegex(begin),
  escapedEnd = pie.string.escapeRegex(end),
  escapedEndFirstChar = pie.string.escapeRegex(end[0]),
  escapedInterp = pie.string.escapeRegex(interp),
  escapedEscape = pie.string.escapeRegex(escape),
  escapedEvalr  = pie.string.escapeRegex(evalr),
  escapedSplitter = pie.string.escapeRegex(splitter);

  pie.string._templateSettings = {
    begin: begin,
    end: end,
    interp: interp,
    escape: escape,
    eval: evalr,
    splitter: splitter,
    interpRegex:      new RegExp(escapedBegin + '([' + pie.array.compact([escapedInterp, escapedEscape, escapedEvalr], true).join('') + ']?)(.+?)' + escapedEnd, 'g'),
    interpLookahead:  new RegExp("'(?=[^" + escapedEndFirstChar + "]*" + escapedEnd + ")", 'g'),
    splitterRegex:    new RegExp(escapedSplitter, 'g'),
  };
};

pie.string.setTemplateSettings('[%', '%]', '-', '=', '');

//**pie.string.template**
//
// Resig style microtemplating. Preserves whitespace, and only uses string manipulation.
// There is no array construction. Allows an optional variables string `varString` which enables
// custom variable definition inside of the templating function.
//
// ```
// var template = pie.string.template("Hi, [%= data.first_name %]. You have [%= data.count %] [%= pie.string.pluralize('messages', data.count) %]");
// template({first_name: 'John', count: 4});
// //=> "Hi, John. You have 4 messages."
// ```
pie.string.template = function(str, varString) {
  var conf = pie.string._templateSettings,
  strFunc = "var __p='', __s = function(v, e){ return v == null ? '' : (e ? pie.string.escapeHtml(v) : v); };\n" ;
  if(varString) strFunc += varString + ";\n";
  strFunc += "__p += '";

  /**** preserve format by allowing multiline strings. ****/
  strFunc += str.replace(/\n/g, "\\n\\\n")
  /**** EX: "... __p += '[% data.foo = 1 %]text's content[%- data.foo %]more text[%= data['foo'] + 1 %]" ****/

  /**** replace all interpolation single quotes with a unique identifier. ****/
  .replace(conf.interpLookahead, conf.splitter)
  /**** EX: "... __p += '[% data.foo = 1 %]text's content[%- data.foo %]more text[%= data[~~pie-interp~~foo~~pie-interp~~] + 1 %]" ****/

  /**** now replace all quotes with an escaped quote. ****/
  .replace(/'/g, "\\'")
  /**** EX: "... __p += '[% data.foo = 1 %]text\'s content[%- data.foo %]more text[%= data[~~pie-interp~~foo~~pie-interp~~] + 1 %]" ****/

  /**** and reapply the single quotes in the interpolated content. ****/
  .replace(conf.splitterRegex, "'")
  /**** EX: "... __p += '[% data.foo = 1 %]text\'s content[%- data.foo %]more text[%= data['foo'] + 1 %]" ****/

  /**** escape, interpolate, and evaluate ****/
  .replace(conf.interpRegex, function(match, action, content) {
    action = action || '';
    if(action === conf.escape) {
      return "' + __s(" + content + ", true) + '";
    } else if (action === conf.interp) {
      return "' + __s(" + content + ", false) + '";
    } else if (action === conf.eval) {
      return "'; " + content + "; __p+='";
    }
  });
  /**** EX: "... __p += ''; data.foo = 1; __p+='text\'s content' + __s(data.foo, true) + 'more text' + __s(data['foo'] + 1) + '" ****/

  /**** terminate the string ****/
  strFunc += "';";
  /**** EX: "... __p +=''; data.foo = 1; __p+='text\'s content' + __s(data.foo, true) + 'more text' + __s(data['foo'] + 1) + '';" ****/

  /**** final result. ****/
  strFunc += "return __p;";

  return new Function("data", strFunc);
};

pie.string.titleize = function(str) {
  return str.replace(/(^| )([a-z])/g, function(match, a, b){ return a + b.toUpperCase(); });
};

pie.string.pathSteps = function(path) {
  var split = path.split('.'),
  steps = [];

  while(split.length) {
    steps.push(split.join('.'));
    split.pop();
  }

  return steps;
};

pie.string.underscore = function(str) {
  return str.replace(/([a-z])([A-Z])/g, function(match, a, b){ return a + '_' + b.toLowerCase(); }).toLowerCase();
};

pie.string.upcase = function(str) {
  return str.toUpperCase();
};


pie.string.urlConcat = function() {
  var args = pie.array.compact(pie.array.from(arguments), true),
  base = args.shift(),
  query = args.join('&');

  if(!query.length) return base;

  // we always throw a question mark on the end of base
  if(base.indexOf('?') < 0) base += '?';

  // we replace all question marks in the query with &
  if(query.indexOf('?') === 0) query = query.replace('?', '&');
  else if(query.indexOf('&') !== 0) query = '&' + query;

  base += query;
  base = base.replace('?&', '?').replace('&&', '&').replace('??', '?');
  if(base.indexOf('?') === base.length - 1) base = base.substr(0, base.length - 1);
  return base;
};
// # Bindings Mixin
// A mixin to provide two way data binding between a model and dom elements.
// This mixin should be used with a pie view.
pie.mixins.bindings = {

  // The registration & configuration of bindings is kept in this._bindings.
  init: function() {
    this._bindings = [];
    if(this._super) this._super.apply(this, arguments);
    this.options.bindingAttribute = this.options.bindingAttribute || 'data-bind';
  },

  // If we have an emitter, tap into the render:after event and initialize the dom
  // with our model values.
  setup: function() {
    this.eon('render:after', 'initBindings');

    this._super.apply(this);
  },

  // Register 1+ bindings within the view.
  //
  // ```
  // this.bind({ attr: 'first_name' }, { attr: 'last_name' })
  // ```;
  bind: function() {
    var opts;
    for(var i = 0; i < arguments.length; i++) {
      opts = arguments[i];
      if(!opts.model) opts.model = this.model;
      if(pie.object.isString(opts.model)) opts.model = this[opts.model];
      if(pie.object.isString(opts.decorator)) opts.decorator = this[opts.decorator] || this.app.helpers.fetch(opts.decorator);
      this._bindings.push(pie.binding.create(this, opts.model, opts));
    }
  },

  setupDomBindings: function() {
    if(!this.options.bindingAttribute) return;

    this.removeUnattachedBindings();

    var nodes = this.qsa('[' + this.options.bindingAttribute + ']'), stringOpts, node, opts;

    var binder = function(str) {
      if(str.indexOf('=') === -1) opts = {attr: str};
      else opts = this.parseStringBinding(str);
      opts.sel = node;
      this.bind(opts);
    }.bind(this);

    for(var i = 0; i < nodes.length; i++) {
      node = nodes[i];
      stringOpts = node.getAttribute(this.options.bindingAttribute);
      stringOpts.split(';').forEach(binder);
    }
  },

  removeUnattachedBindings: function() {
    var compactNeeded = false, b;
    for(var i = 0; i < this._bindings.length; i++) {
      b = this._bindings[i];
      if(pie.object.isNode(b.sel) && !document.contains(b.sel)) {
        this._bindings[i] = undefined;
        b.teardown();
        compactNeeded = true;
      }
    }

    if(compactNeeded) this._bindings = pie.array.compact(this._bindings);
  },

  parseStringBinding: function(inputString) {
    var opts = pie.object.expand(pie.string.deserialize(inputString));
    return opts;
  },

  initBindings: function() {
    // look for dom-defined bindings and add them to our _bindings list.
    this.setupDomBindings();

    // Iterate each binding and propagate the model value to the dom.
    pie.array.each(this._bindings, 'toView', true);
  },


  /* Iterate each binding and propagate the dom value to the model. */
  /* A single set of change records will be produced (`__version` will only increment by 1). */
  readBoundFields: function() {
    var opts = {skipObservers: true}, models;
    this._bindings.forEach(function(binding) { binding.readFields(opts); });
    models = pie.array.unique(pie.array.map(this._bindings, 'model'));
    pie.array.each(models, 'deliverChangeRecords', true);
  }
};
pie.mixins.changeSet = {

  get: function(name) {
    return this.query({name: name});
  },

  has: function(name) {
    var glob = pie.string.endsWith(name, '.*') ? name.replace('.*', '') : undefined;

    return pie.array.areAny(this, function(change) {
      return glob ? pie.string.startsWith(change.name, glob + '.') : change.name === name;
    });
  },

  hasAny: function() {
    for(var i = 0; i < arguments.length; i++) {
      if(this.has(arguments[i])) return true;
    }
    return false;
  },

  hasAll: function() {
    for(var i = 0; i < arguments.length; i++) {
      if(!this.has(arguments[i])) return false;
    }
    return true;
  },

  query: function(options) {
    return this._query('detectLast', options);
  },

  queryAll: function(options) {
    return this._query('filter', options);
  },

  _query: function(arrayFn, options) {
    var names = pie.array.from(options.names || options.name),
    types = pie.array.from(options.types || options.type);

    return pie.array[arrayFn](this, function(change) {
      return (!names.length || ~names.indexOf(change.name)) &&
             (!types.length || ~types.indexOf(change.type));
    });
  }

};
pie.mixins.container = {

  init: function() {
    this.children = [];
    this.childNames = {};
    if(this._super) this._super.apply(this, arguments);
  },

  addChild: function(name, child, idx) {
    var append = idx == null;
    idx = append ? this.children.length : idx;
    this.children.splice(idx, 0, child);

    this.childNames[name] = idx;
    child._indexWithinParent = idx;
    child._nameWithinParent = name;
    child.parent = this;

    if(!append) this.sortChildren();

    if(pie.object.has(child, 'addedToParent', true)) child.addedToParent.call(child);

    return this;
  },

  addChildren: function(obj) {
    pie.object.forEach(obj, function(name, child) {
      this.addChild(name, child);
    }.bind(this));
  },

  getChild: function(obj, recurse) {
    /* jslint eqeq:true */
    if(obj == null) return;
    if(obj._nameWithinParent) return obj;

    var idx = this.childNames[obj];
    if(idx == null) idx = obj;

    if(recurse === undefined) recurse = true;

    // It's a path.
    if(recurse && String(idx).indexOf('.') > 0) {
      var steps = idx.split('.'),
      child = this, step;
      while(step = steps.shift()) {
        child = child.getChild(step);
        if(!child) return undefined;
        /* dig as far as we can go, if we have non-container child we're done */
        if(steps.length && !child.getChild) return undefined;
      }

      return child;
    }

    return ~idx && pie.object.isNumber(idx) && this.children[idx] || undefined;
  },

  isInApp: function() {
    if(pie.object.isApp(this)) return true;
    else if(this.parent) {
      return this.parent.isInApp()
    } else {
      return false;
    }
  },

  bubble: function() {
    var args = pie.array.from(arguments),
    fname = args.shift(),
    obj = this.parent;

    while(obj && !pie.object.has(obj, fname, true)) {
      obj = obj.parent;
    }

    if(obj) return obj[fname].apply(obj, args);
  },

  sendToChildren: function(/* fnName, arg1, arg2 */) {
    var allArgs = pie.array.from(arguments),
    fnName = allArgs[0],
    args = allArgs.slice(1);

    this.children.forEach(function(child){
      if(pie.object.has(child, fnName, true)) child[fnName].apply(child, args);
      if(pie.object.has(child, 'sendToChildren', true)) child.sendToChildren.apply(child, allArgs);
    }.bind(this));
  },

  removeChild: function(obj) {
    var child = this.getChild(obj), i;

    if(child) {
      i = child._indexWithinParent;
      this.children.splice(i, 1);

      // clean up
      delete this.childNames[child._nameWithinParent];
      delete child._indexWithinParent;
      delete child._nameWithinParent;
      delete child.parent;

      this.sortChildren();

      if(pie.object.has(child, 'removedFromParent', true)) child.removedFromParent.call(child, this);
    }

    return this;
  },

  removeChildren: function() {
    var child;

    while(child = this.children[this.children.length-1]) {
      this.removeChild(child);
    }

    return this;
  },

  sortChildren: function(fn) {
    if(fn) this.children.sort(fn);
    this.children.forEach(function(c, i) {
      c._indexWithinParent = i;
      this.childNames[c._nameWithinParent] = i;
    }.bind(this));
  },

  __tree: function(indent) {
    indent = indent || 0;
    var pad = function(s, i){
      if(!i) return s;
      while(i-- > 0) s = " " + s;
      return s;
    };
    var str = "\n", nextIndent = indent + (indent ? 4 : 1);
    str += pad((indent ? '|- ' : '') + (this._nameWithinParent || this._indexWithinParent || this.__className) + ' (' + (this.__className || pie.uid(this)) + ')', indent);

    this.children.slice(0, 10).forEach(function(child) {
      str += "\n" + pad('|', nextIndent);
      str += child.__tree(nextIndent);
    });

    if(!indent) str += "\n";

    return str;
  }
};
pie.mixins.validatable = {

  init: function() {
    this.validations = [];
    this.validationStrategy = 'dirty';

    if(this._super) this._super.apply(this, arguments);

    this.compute('isValid', 'validationErrors');
  },

  isValid: function() {
    return pie.object.isEmpty(this.data.validationErrors);
  },

  // default to a model implementation
  reportValidationError: function(key, errors) {
    errors = errors && errors.length ? errors : undefined;
    this.set('validationErrors.' + key, errors);
  },

  // validates({name: 'presence'});
  // validates({name: {presence: true}});
  // validates({name: ['presence', {format: /[a]/}]})
  validates: function(obj, validationStrategy) {
    var configs, resultConfigs;

    this.validations = this.validations || {};

    Object.keys(obj).forEach(function(k) {
      // always convert to an array
      configs = pie.array.from(obj[k]);
      resultConfigs = [];

      configs.forEach(function(conf) {

        // if it's a string or a function, throw it in directly, with no options
        if(pie.object.isString(conf)) {
          resultConfigs.push({type: conf, options: {}});
        // if it's a function, make it a type function, then provide the function as an option
        } else if(pie.object.isFunction(conf)){
          resultConfigs.push({type: 'fn', options: {fn: conf}});
        // otherwise, we have an object
        } else if(conf) {

          // iterate the keys, adding a validation for each
          Object.keys(conf).forEach(function(confKey){
            if (pie.object.isObject(conf[confKey])) {
              resultConfigs.push({type: confKey, options: conf[confKey]});

            // in this case, we convert the value to an option
            // {presence: true} -> {type: 'presence', {presence: true}}
            // {format: /.+/} -> {type: 'format', {format: /.+/}}
            } else if(conf[confKey]) {
              resultConfigs.push({
                type: confKey,
                options: pie.object.merge({}, conf)
              });
            }
          });
        }

      });


      if(resultConfigs.length) {

        // append the validations to the existing ones
        this.validations[k] = this.validations[k] || [];
        this.validations[k] = this.validations[k].concat(resultConfigs);

        this.observe(function(changes){
          var change = changes.get(k);
          return this.validationChangeObserver(change);
        }.bind(this), k);
      }

    }.bind(this));

    if(validationStrategy !== undefined) this.validationStrategy = validationStrategy;
  },

  // Invoke validateAll and receive a promise in return.
  // this.validateAll().then(function(){ alert('Success!'); }, function(){ alert('Errors!'); });
  // validateAll will perform all registered validations, asynchronously. When all validations have completed, the promise
  // will be resolved.
  validateAll: function() {
    var promises = Object.keys(this.validations).map(this.validate.bind(this));
    return pie.promise.all(promises);
  },


  validationChangeObserver: function(change) {
    if(this.validationStrategy === 'validate') {
      this.validate(change.name);
    } else if(this.validationStrategy === 'dirty') {
      // for speed.
      if(this.get('validationErrors.' + change.name + '.length')) {
        this.reportValidationError(change.name, undefined);
      }
    }
  },

  // validate a specific key and optionally invoke a callback.
  validate: function(k) {
    var validators = this.app.validator,
    validations = pie.array.from(this.validations[k]),
    value = this.get(k),

    promises = validations.map(function(validation) {
      return pie.promise.create(function(resolve, reject) {

        var validator = validators[validation.type];
        // reject the promise with the error message.
        var wrappedReject = function() {
          reject(validators.errorMessage(validation.type, validation.options));
        };
        var response = validator.call(validators, value, validation.options);

        // validators should return true, false, or a promise.
        if(response === true) resolve();
        else if (response === false) wrappedReject();
        else response.then(resolve, wrappedReject);
      });
    });

    var promise = pie.promise.all(promises);

    promise.then(function(){
      this.reportValidationError(k, undefined);
    }.bind(this), function(errorMessages){
      this.reportValidationError(k, errorMessages);
    }.bind(this));

    return promise;
  }
};
pie.base = {

  __schema: [{

    init: function(){
      pie.uid(this);
    },

    __pieRole: 'object',

    reopen: function(){
      var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
      pie.object.reopen(this, extensions);
      extensions.forEach(function(ext) {
        if(ext.init) ext.init.call(this);
      }.bind(this));
      return this;
    }

  }],

  __pieRole: 'class',

  create: function() {
    return pie.base._create(this, arguments);
  },

  extend: function() {
    var that = this,
    extensions = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    name = pie.object.isString(extensions[0]) ? extensions.shift() : null;

    extensions = pie.array.flatten(extensions.map(function(e){
      if(e.__pieRole === 'class') return e.__schema;
      return e;
    }));

    var schema = pie.array.unique([this.__schema, extensions, {__className: name}]);

    var o = {
      __className: name
    };

    o.__schema = schema;
    o.__pieRole = 'class';

    o.extend = function(){ return that.extend.apply(this, arguments); };
    o.create = function(){ return that.create.apply(this, arguments); };
    o.reopen = function(){ return that.reopen.apply(this, arguments); };

    return o;
  },

  reopen: function() {
    var extensions = pie.array.change(arguments, 'from', 'flatten', 'compact');
    extensions.forEach(function(e){
      this.__schema.push(e);
    }.bind(this));
  },

  _create: function(clazz, args) {
    var schema = clazz.__schema;

    var o = {};
    pie.uid(o);

    pie.object.reopen(o, schema);

    o.init.apply(o, args);
    o.__class = clazz;

    if(!o.app) {
      if(o.options && o.options.app) o.app = o.options.app;
      else o.app = pie.appInstance;
    }

    // This enables objects to be assigned to a global variable to assist with debugging
    // Any pie object can define a debugName attribute or function and the value will be the name of the global
    // variable to which this object is assigned.
    if(o.debugName) {
      window.pieDebug = window.pieDebug || {};
      window.pieDebug[pie.fn.valueFrom(o.debugName)] = o;
    }

    return o;
  }
};
pie.promise = pie.base.extend({

  __pieRole: 'promise',

  init: function(resolver) {

    this.resolves = [];
    this.rejects  = [];

    this.result   = undefined;
    this.state    = 'UNFULFILLED';
    this.ctxt     = undefined;

    if(resolver) {
      setTimeout(function promiseResolverWrapper(){
        try {
          resolver(this.resolve.bind(this), this.reject.bind(this));
        } catch(ex) {
          this.reject(ex);
        }
      }.bind(this), 0);
    }
  },

  bind: function(binding) {
    this.ctxt = binding;
    return this;
  },

  then: function(onResolve, onReject) {
    var child = this.__class.create();
    child.bind(this.ctxt);

    this.resolves.push([onResolve, child]);
    this.rejects.push([onReject, child]);

    if(this.state !== 'UNFULFILLED') {
      setTimeout(this._flush.bind(this), 0);
    }

    return child;
  },

  catch: function(reject) {
    return this.then(undefined, reject);
  },

  reject: function(value) {
    this._transition('FAILED', value);
  },

  resolve: function(value) {
    this._transition('FULFILLED', value);
  },

  _transition: function(state, value) {
    if(this.state === 'UNFULFILLED') {
      this.state = state;
      this.result = value;
      this._flush();
    }
  },

  _flush: function() {
    if (this.state === "FAILED" && !this.rejects.length && this.result instanceof Error) {
      this.app.errorHandler.handleUnknownError(this.result);
    } else {
      var list = this.state === 'FULFILLED' ? this.resolves : this.rejects;
      var tuple, callback, promise, result;

      while(list.length) {
        tuple = list.pop();
        callback = tuple[0];
        promise = tuple[1];
        result = this.result;

        if(promise.ctxt) {
          if(pie.object.isString(callback)) {
            callback = promise.ctxt[callback].bind(promise.ctxt);
          } else if (pie.object.isFunction(callback)) {
            callback = callback.bind(promise.ctxt);
          }
        }

        if(pie.object.isFunction(callback)) {
          try {
            result = callback(this.result);
          } catch(e) {
            promise.reject(e);
            continue;
          }

          if(result === promise) {
            promise.reject(new TypeError("The result of a promise's callback cannot be the promise. [2.3.1]"));
            continue;
          }

        }

        if(pie.object.isPromise(result)) {
          result.then(promise.resolve.bind(promise), promise.reject.bind(promise));
        } else if(this.state === 'FULFILLED') {
          promise.resolve(result);
        } else {
          promise.reject(result);
        }
      }
    }
  }
});

pie.promise.from = function(thing) {
  if(pie.object.isPromise(thing)) return thing;
  if(pie.object.isFunction(thing)) return pie.promise.create(thing);
  return pie.promise.resolve(thing);
};

pie.promise.all = function(iteratable) {
  var instance = pie.promise.create(),
  promises = [],
  values = [],
  cnt = 0,
  total;

  for(var k in iteratable) {
    if(iteratable.hasOwnProperty(k)) {
      promises.push(pie.promise.from(iteratable[k]));
    }
  }

  total = promises.length;

  if(total) {
    promises.forEach(function allPromiseIterator(p, i) {
      p.then(function allPromiseCallback(val) {
        values[i] = val;
        cnt++;
        if(cnt === total) instance.resolve(values);
      }, instance.reject.bind(instance));
    });
  } else {
    instance.resolve(values);
  }

  return instance;
};

pie.promise.race = function(iteratable) {
  var instance = pie.promise.create();

  for(var k in iteratable) {
    if(iteratable.hasOwnProperty(k)) {
      pie.promise.from(iteratable[k]).then(instance.resolve.bind(this), instance.reject.bind(this));
    }
  }
  return instance;
};

pie.promise.resolve = function(val) {
  var p = pie.promise.create();
  p.state = 'FULFILLED';
  p.result = val;
  return p;
};

pie.promise.reject = function(val) {
  var p = pie.promise.create();
  p.state = 'FAILED';
  p.result = val;
  return p;
};
pie.pathHelper = pie.base.extend('pathHelper', {

  hostRegex: /^(https?:\/\/)([^\/]+)(.+)/,

  currentHost: function() {
    return window.location.host;
  },

  isCurrentHost: function(incoming) {
    return this.currentHost() === incoming;
  },

  stripHost: function(incoming, options) {
    var m = incoming.match(this.hostRegex);
    if(!m) return incoming;
    if(options && options.onlyCurrent && this.isCurrentHost(m[1])) return m[3];
    if(options && options.onlyOther && !this.isCurrentHost(m[1])) return m[3];
    return m[3];
  },

  hasHost: function(incoming) {
    return this.hostRegex.test(incoming);
  },

  pathAndQuery: function(path, query) {
    var o = {
      path: path,
      query: query
    };

    if(path && path.indexOf('?') >= 0) {
      var split = path.split('?');
      o.query = pie.object.merge(pie.string.deserialize(split[1]), query);
      o.path = split[0];
    }

    return o;
  }

});
// # Pie App
//
// The app class is the entry point of your application. It acts as the container in charge of managing the page's context.
// It provides access to application utilities, routing, templates, i18n, etc.
// It observes browser and link navigation and changes the page's context automatically.
pie.app = pie.base.extend('app', {

  __pieRole: 'app',

  init: function(options) {

    /* `pie.base.create` handles the setting of an app, */
    /* but we don't want a reference to another app within this app. */
    delete this.app;

    /* Set a global instance which can be used as a backup within the pie library. */
    pie.appInstance = pie.appInstance || this;

    /* Register with pie to allow for nifty global lookups. */
    pie.apps[pie.uid(this)] = this;

    /* Default application options. */
    this.options = pie.object.deepMerge({
      uiTarget: 'body',
      unsupportedPath: '/browser/unsupported',
      verifySupport: true
    }, options);

    if(this.options.verifySupport && !this.verifySupport()) {
      window.location.href = this.options.unsupportedPath;
      return;
    }

    // `classOption` allows class configurations to be provided in the following formats:
    // ```
    // pie.app.create({
    //   i18n: myCustomI18nClass,
    //   i18nOptions: {foo: 'bar'}
    // });
    // ```
    // which will result in `this.i18n = myCustomI18nClass.create(this, {foo: 'bar'});`
    //
    // Alternatively you can provide instances as the option.
    // ```
    // var instance = myCustomI18nClass.create();
    // pie.app.create({
    //   i18n: instance,
    // });
    // ```
    // which will result in `this.i18n = instance; this.i18n.app = this;`
    var classOption = function(key, _default){
      var k = this.options[key],
      opt = this.options[key + 'Options'] || {};

      if(k === false) return;

      k = k || _default;

      if(k.__pieRole === 'class') {
        return k.create(this, opt);
      } else if (pie.object.isFunction(k)) {
        return k(this, opt);
      } else {
        k.app = this;
        return k;
      }
    }.bind(this);


    // The model that represents the current state of the app.
    this.state = pie.appState.create();

    // `app.config` is a model used to manage configuration objects.
    this.config = classOption('config', pie.config);

    // `app.cache` is a centralized cache store to be used by anyone.
    this.cache = classOption('cache', function(){
      return pie.cache.create({}, {app: this});
    }.bind(this));

    // `app.storage` is used for local, session, cache, etc storage
    this.storage = classOption('storage', pie.dataStore);

    // `app.emitter` is an interface for subscribing and observing app events
    this.emitter = classOption('emitter', pie.emitter);

    // `app.i18n` is the translation functionality
    this.i18n = classOption('i18n', pie.i18n);

    // `app.ajax` is ajax interface + app specific functionality.
    this.ajax = classOption('ajax', pie.ajax);

    // `app.notifier` is the object responsible for showing page-level notifications, alerts, etc.
    this.notifier = classOption('notifier', pie.notifier);

    // `app.errorHandler` is the object responsible for
    this.errorHandler = classOption('errorHandler', pie.errorHandler);

    // `app.router` is used to determine which view should be rendered based on the url
    this.router = classOption('router', pie.router);

    // `app.routeHandler` extracts information from the current route and determines what to do with it.
    this.routeHandler = classOption('routeHandler', pie.routeHandler);

    // `app.navigator` observes app.state and updates the browser.
    // it is imperative that the router is created before the navigator since
    // the navigator observes both state.id and state.route;
    this.navigator = classOption('navigator', pie.navigator);

    // `app.resources` is used for managing the loading of external resources.
    this.resources = classOption('resources', pie.resources);

    // Template helper methods are evaluated to the local variable `h` in templates.
    // Any methods registered with this helpers module will be available in templates
    // rendered by this app's `templates` object.
    this.helpers = classOption('helpers', pie.helpers);

    // `app.templates` is used to manage and render application templates.
    this.templates = classOption('templates', pie.templates);

    // `app.validator` a validator intance to be used in conjunction with this app's model activity.
    this.validator = classOption('validator', pie.validator);

    this.pathHelper = classOption('pathHelper', pie.pathHelper);


    // Before we get going, observe link navigation & show any notifications stored
    // in app.storage.
    // Wrapped in a function for testing purposes.
    this.emitter.once('start:before', function(){ this.setupSinglePageLinks(); }.bind(this));

    if(!this.options.noAutoStart) {
      // Once the dom is loaded, start the app.
      document.addEventListener('DOMContentLoaded', this.start.bind(this));
    }

    this._super();
  },

  // Just in case the client wants to override the standard confirmation dialog.
  // Eventually this could create a confirmation view and provide options to it.
  // The dialog should return a promise which is resolved if the dialog is confirmed
  // and rejected if the dialog is denied.
  confirm: function(text) {
    return pie.promise.create(function(resolve, reject){
      if(window.confirm(text)) resolve();
      else reject();
    });
  },

  debug: function() {
    if(window.console && window.console.log) {
      window.console.log.apply(window.console, arguments);
    }
  },

  // Use this to build paths.
  path: function(path, query) {

    if(pie.object.isObject(path)) {
      query = path;
      path = undefined;
    }

    if(!pie.object.isObject(query)) query = undefined;

    var pq = this.pathHelper.pathAndQuery(path, query);

    // if we don't know our path but have been given a query, try to build a path based on the existing route
    if(pq.path == null && pq.query) {
      var currentRoute = this.state.get('__route');

      if(currentRoute) {
        pq.path = currentRoute.get('pathTemplate');
        pq.query = pie.object.merge({}, this.state.get('__query'), this.state.get('__interpolations'), pq.query);
      }
    }

    pq.path = pq.path || '/';
    pq.path = this.pathHelper.stripHost(pq.path, {onlyCurrent: true});

    // if a router is present and we're dealing with a relative path we can allow the passing of named routes.
    if(!this.pathHelper.hasHost(pq.path) && this.router) pq.path = this.router.path(pq.path, pq.query);
    else if(!pie.object.isEmpty(pq.query)) pq.path = pie.string.urlConcat(pq.path, pie.object.serialize(pq.query));

    return pq.path;
  },

  // Use this to navigate around the app.
  // ```
  // app.go('/test-url');
  // app.go('namedUrl');
  // app.go({foo: 'bar'});
  // app.go('/things/:id', {id: 4});
  // ```
  //
  go: function(/* path?, query?, skipHistory? */){
    var id = this.path.apply(this, arguments);

    var skipHistory = pie.array.last(arguments);
    if(!pie.object.isBoolean(skipHistory)) skipHistory = false;

    this.state.transition(id, skipHistory);
  },

  // Callback for when a link is clicked in our app
  handleSinglePageLinkClick: function(e){
    // if routing is disabled, return
    if (this.config.get('disableRouting')) return;
    // If the link is targeting something else, let the browser take over
    if(e.delegateTarget.getAttribute('target')) return;

    // If the user is trying to do something beyond simple navigation, let the browser take over
    if(e.ctrlKey || e.metaKey || e.button > 0) return;

    // Extract the location from the link.
    var href = e.delegateTarget.getAttribute('href');

    // If we're going nowhere, somewhere else, or to an anchor on the page, let the browser take over
    if(!href || /^(#|[a-z]+:\/\/)/.test(href)) return;

    if(this.router && !this.router.hasRoot(href)) return;

    e.preventDefault();
    this.go(href, !!e.delegateTarget.getAttribute('data-replace-state'));
  },

  // When a link is clicked, go there without a refresh if we recognize the route.
  setupSinglePageLinks: function() {
    var target = pie.qs(this.routeHandler.options.uiTarget);
    if (target !== null) {
      pie.dom.on(target, 'click', this.handleSinglePageLinkClick.bind(this), 'a[href]');
    }
  },

  // Start the app by starting the navigator (which we have observed).
  start: function() {
    this.emitter.fireSequence('start');
  },

  verifySupport: function() {
    var el = document.createElement('_');

    return !!(el.classList &&
      window.history.pushState &&
      Date.prototype.toISOString &&
      Array.isArray &&
      Array.prototype.forEach &&
      Object.keys &&
      Number.prototype.toFixed);
  },


}, pie.mixins.container);
// # Pie Model
// ### Setters and Getters
// pie.model provides a basic interface for object management and observation.
//
// *example:*
//
// ```
// var user = pie.model.create();
// user.set('first_name', 'Doug');
// user.get('first_name') //=> 'Doug'
// user.sets({
//   first_name: 'Douglas',
//   last_name: 'Wilson'
// });
// user.get('last_name') //= 'Wilson'
//
// user.set('location.city', 'Miami')
// user.get('location.city') //=> 'Miami'
// user.get('location') //=> {city: 'Miami'}
// ```
//
// ### Observers
//
// Observers can be added by invoking the model's `observe()` function.
// `pie.model.observe()` optionally accepts 2+ arguments which are used as filters for the observer.
//
// *example:*
//
// ```
// var o = function(changes){ console.log(changes); };
// var user = pie.model.create();
// user.observe(o, 'first_name');
// user.sets({first_name: 'first', last_name: 'last'});
// // => o is called and the following is logged:
// [{...}, {
//   name: 'first_name',
//   type: 'new',
//   oldValue:
//   undefined,
//   value: 'first',
//   object: {...}
// }]
// ```
//
// Note that the changes are extended with the `pie.mixin.changeSet` functionality, so check that out too.
//
// ### Computed Properties
//
// `pie.models` can observe themselves and compute properties. The computed properties can be observed
// just like any other property.
//
// *example:*
//
// ```
// var fullName = function(){ return this.get('first_name') + ' ' + this.get('last_name'); };
// var user = pie.model.create({first_name: 'Doug', last_name: 'Wilson'});
// user.compute('full_name', fullName, 'first_name', 'last_name');
// user.get('full_name') //=> 'Doug Wilson'
// user.observe(function(changes){ console.log(changes); }, 'full_name');
// user.set('first_name', 'Douglas');
// // => the observer is invoked and console.log provides:
// [{..}, {
//   name: 'full_name',
//   oldValue: 'Doug Wilson',
//   value: 'Douglas Wilson',
//   type: 'update',
//   object: {...}
// }]
// ```
//
// If a function is not provided as the definition of the computed property, it will look
// for a matching function name within the model.


pie.model = pie.base.extend('model', {

  __pieRole: 'model',

  init: function(d, options) {

    if(d && d.__pieRole === 'model') d = d.data;

    this.data = pie.object.deepMerge({__version: 1}, d);
    this.options = options || {};
    this.app = this.app || this.options.app || pie.appInstance;
    this.observations = {};
    this.observedKeyCounts = {};
    this.changeRecords = [];
    this.deliveringRecords = 0;

    this._super();
  },

  // ** pie.model.compute **
  //
  // Register a computed property which is accessible via `name` and defined by `fn`.
  // Provide all properties which invalidate the definition.
  // If the definition of the property is defined by a function of the same name, the function can be ommitted.
  // ```
  // Model.reopen({fullName: function(){ /*...*/ }});
  // model.compute('fullName', 'first_name', 'last_name');
  // model.compute('displayName', function(){}, 'fullName');
  // ```
  compute: function(/* name, fn?[, prop1, prop2 ] */) {
    var props = pie.array.from(arguments),
    name = props.shift(),
    fn = props.shift(),
    wrap;

    props = pie.array.flatten(props);

    if(!pie.object.isFunction(fn)) {
      props.unshift(fn);
      fn = this[name].bind(this);
    }

    wrap = function(/* changes */){
      this.set(name, fn.call(this), {skipObservers: true});
    }.bind(this);

    this.observe(wrap, props);
    this.observations[pie.uid(wrap)].computed = true;

    /* Initialize the computed properties value immediately. */
    this.set(name, fn.call(this));
  },

  // **pie.model.addChangeRecord**
  //
  // Add a change record to this model. If a change record of the same name already exists,
  // update the existing value.
  addChangeRecord: function(name, type, oldValue, value, extras) {

    this.isDirty = true;

    if(!this.shouldAddChangeRecordForAttribute(name)) return;

    var existing = !/\*$/.test(name) && pie.array.detect(this.changeRecords, function(r){ return r && r.name === name; });

    if(existing) {
      var remove = false;
      existing.value = value;

      // if we previously deleted this value but it's been added back in, just report an update.
      if(existing.type === 'delete' && type === 'add') existing.type = 'update';
      else if(existing.type === 'add' && type === 'delete') remove = true;
      // if we previously delete this value but have now added an object, report a path update.
      else if(existing.type === 'delete' && type === 'pathUpdate') existing.type = 'pathUpdate';
      // if we previously deleted this value but have now changed it, inherit the new type.
      else if(type === 'delete') existing.type = type;

      // if the result is an update but the values are identical, remove the change record.
      if(existing.type === 'update' && existing.oldValue === existing.value) remove = true;

      if(remove) {
        this.changeRecords = pie.array.remove(this.changeRecords, existing);
      }

      if(extras) pie.object.merge(existing, extras);

      return;
    }

    var change = {
      name: name,
      type: type,
      value: value,
      object: this
    };

    if(oldValue != null) change.oldValue = oldValue;
    if(extras) pie.object.merge(change, extras);

    this.changeRecords.push(change);
  },

  // ** pie.model.deliverChangeRecords **
  //
  // After updates have been made we deliver our change records to our observers
  deliverChangeRecords: function(options) {
    if(!this.isDirty) return this;
    if(this.deliveringRecords) return this;

    /* This is where the version tracking is incremented. */
    if(!options || !options.skipVersionTracking) this.trackVersion();


    var changeSet = this.changeRecords,
    emptyChangeSet = this.observedKeyCounts['~'] ? pie.object.merge([], pie.mixins.changeSet) : undefined,
    observers = pie.object.values(this.observations),
    invoker = function changeRecordDelivery(obj) {
      if(~obj.keys.indexOf('*')) obj.fn.call(null, changeSet);
      else if(changeSet.hasAny.apply(changeSet, obj.keys)) obj.fn.call(null, changeSet);
      else if(~obj.keys.indexOf('~')) obj.fn.call(null, emptyChangeSet);
    }.bind(this),
    o, idx;

    /* We modify the `changeSet` array with the `pie.mixins.changeSet`. */
    pie.object.merge(changeSet, pie.mixins.changeSet);


    /* Deliver change records to all computed properties first. */
    /* This will ensure that the change records include the computed property changes */
    /* along with the original property changes. */
    while(~(idx = pie.array.indexOf(observers, 'computed'))) {
      o = observers[idx];
      observers.splice(idx, 1);
      invoker(o);
    }

    /* Now we reset the changeRecords on this model. */
    this.changeRecords = [];

    /* We increment our deliveringRecords flag to ensure records are delivered in the correct order */
    this.deliveringRecords++;

    /* And deliver the changeSet to each observer. */
    observers.forEach(invoker);

    /* Now we can decrement our deliveringRecords flag and attempt to deliver any leftover records */
    this.deliveringRecords--;
    if(this.changeRecords.length) this.deliverChangeRecords(options);

    this.isDirty = false;

    return this;

  },

  // ** pie.model.get **
  //
  // Access the value stored at data[key]
  // Key can be multiple levels deep by providing a dot separated key.
  // ```
  // model.get('foo')
  // //=> 'bar'
  // model.get('bar.baz')
  // //=> undefined
  // ```
  get: function(key) {
    return pie.object.getPath(this.data, key);
  },

  // ** pie.model.getOrSet **
  //
  // Retrieve or set a key within the model.
  // The `defaultValue` will only be used if the value at `key` is `== null`.
  // ```
  // model.getOrSet('foo', 'theFirstValue');
  // //=> 'theFirstValue'
  // model.getOrSet('foo', 'theSecondValue');
  // //=> 'theFirstValue'
  // ```
  getOrSet: function(key, defaultValue) {
    var val = this.get(key);
    if(val != null) return val;

    this.set(key, defaultValue);
    return this.get(key);
  },

  // ** pie.model.gets **
  //
  // Retrieve multiple values at once.
  // Returns an object of names & values.
  // Path keys will be transformed into objects.
  // ```
  // model.gets('foo.baz', 'bar');
  // //=> {foo: {baz: 'fooBazValue'}, bar: 'barValue'}
  // ```
  gets: function() {
    var args = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    o = {};

    args.forEach(function getsIterator(arg){
      if(this.has(arg)) {
        pie.object.setPath(o, arg, this.get(arg));
      }
    }.bind(this));

    return o;
  },

  // ** pie.model.has **
  //
  // Determines whether a path exists in our data.
  // ```
  // model.has('foo.bar')
  // //=> true | false
  // ```
  has: function(path) {
    return !!pie.object.hasPath(this.data, path);
  },

  // ** pie.model.hasAll **
  //
  // Determines whether all paths exist in our data.
  // ```
  // model.hasAll('foo', 'bar')
  // //=> true | false
  // ```
  hasAll: function() {
    var args = pie.array.change(arguments, 'from', 'flatten'), i;

    for(i = 0; i < args.length; i++) {
      if(!this.has(args[i])) return false;
    }
    return true;
  },

  // ** pie.model.hasAny **
  //
  // Determines whether any key given exists
  // ```
  // model.hasAny('foo', 'bar')
  // //=> true | false
  // ```
  hasAny: function() {
    var args = pie.array.change(arguments, 'from', 'flatten'), i;

    for(i = 0; i < args.length; i++) {
      if(this.has(args[i])) return true;
    }
    return !args.length;
  },

  shouldAddChangeRecordForAttribute: function(key) {
    if(!!this.observedKeyCounts['*']) return true;
    if(!!this.observedKeyCounts[key]) return true;

    if(~key.indexOf('.')) {
      var paths = pie.string.pathSteps(key).slice(1);
      if(pie.array.areAny(paths, function changeRecordApplicabilityChecker(p){ return !!this.observedKeyCounts[p + '.*']; }.bind(this))) return true;
    }

    return false;
  },

  // ** pie.model.is **
  //
  // Boolean check the value at `path`.
  // ```
  // model.is('foo.bar')
  // //=> true | false
  // ```
  is: function(path) {
    return !!this.get(path);
  },

  // ** pie.model.merge **
  //
  // Set keys, but do so by merging with the current values
  // ```
  // model.set('location.city', "San Francisco")
  // model.set('location.lat', 0);
  // model.set('location.lng', 0);
  // model.merge({location: {lat: 37.77, lng: -122.44}})
  // model.get('location')
  // //=> {city: "San Francico", lat: 37.77, lng: -122.44}
  merge: function(/* objs */) {
    var obj = arguments.length > 1 ? pie.object.deepMerge.apply(null, arguments) : arguments[0];
    obj = pie.object.flatten(obj);
    this.sets(obj);
  },

  // ** pie.model.observe **
  //
  // Register an observer and optionally filter by key.
  // If no keys are provided, any change will result in the observer being triggered.
  // ```
  // model.observe(function(changeSet){
  //   console.log(changeSet);
  // });
  // ```
  // ```
  // model.observe(function(changeSet){
  //   console.log(changeSet);
  // }, 'fullName');
  // ```
  observe: function(/* fn1[, fn2, fn3[, key1, key2, key3]] */) {
    var args = pie.array.change(arguments, 'from', 'flatten'),
    part = pie.array.partition(args, pie.object.isFunction),
    fns = part[0],
    keys = part[1],
    cnt;

    if(!keys.length) keys = ['~'];

    keys.forEach(function observedKeyCountIncrementer(k) {
      cnt = this.observedKeyCounts[k];
      this.observedKeyCounts[k] = (cnt || 0) + 1;
    }.bind(this));

    fns.forEach(function observerStorer(fn){

      /* Setting the uid is needed because we'll want to manage unobservation effectively. */
      pie.uid(fn);

      this.observations[pie.uid(fn)] = {
        fn: fn,
        keys: keys
      };

    }.bind(this));

    return this;
  },

  // ** pie.model.reset **
  //
  // Reset a model to it's empty state, without affecting the `__version` attribute.
  // Optionally, you can pass any options which are valid to `sets`.
  // ```
  // model.reset({skipObservers: true});
  // ```
  reset: function(options) {
    var keys = Object.keys(this.data), o = {};

    keys.forEach(function resetIterator(k){
      if(k === '__version') return;
      o[k] = undefined;
    });

    return this.sets(o, options);
  },

  // ** pie.model.set **
  //
  // Set a `value` on the model at the specified `key`.
  // Valid options are:
  // * skipObservers - when true, observers will not be triggered.
  // * skipParents   - when true, parent change records will not be sent.
  // * skipChildren  - when true, child change records will not be sent.
  //
  // *Note: skipping observation does not stop `changeRecords` from accruing.*
  // ```
  // model.set('foo', 'bar');
  // model.set('foo.baz', 'bar');
  // model.set('foo', 'bar', {skipObservers: true});
  // ```
  set: function(key, value, options) {

    if(pie.object.isPlainObject(value) && !pie.object.isEmpty(value)) {
      // since we're overriding an object we need to unset it.
      // we add change records for the children, but don't worry about the parents
      // since the sets() will take care of that.
      this.set(key, undefined, pie.object.merge({}, options, {
        skipObservers: true,
        skipParents: true
      }));

      value = pie.object.flatten(value, key + '.');
      this.sets(value, options);
      return;
    }

    var changeName = key,
    changeType, changeOldValue, changeValue;

    changeOldValue = pie.object.getPath(this.data, key);

    /* If we haven't actually changed, don't bother doing anything. */
    if((!options || !options.force) && value === changeOldValue) return this;

    if(changeOldValue !== undefined) {
      changeType = 'update';
    }

    var parentKeys = (!options || !options.skipParents) && ~key.indexOf('.') ? pie.string.pathSteps(key).slice(1) : null,
    childKeys, nestedOpts, i;


    if((!options || !options.skipChildren) && pie.object.isPlainObject(changeOldValue)) {
      childKeys = Object.keys(pie.object.flatten(changeOldValue, key + '.'));
    }

    nestedOpts = childKeys || parentKeys ? pie.object.merge({}, options, {skipChildren: true, skipParents: true}) : null;

    if(childKeys && childKeys.length) {
      // add change records for the deleted children.
      for(i = 0; i < childKeys.length; i++) {
        this.set(childKeys[i], undefined, nestedOpts);
      }
    }

    changeValue = value;

    /* If we are "unsetting" the value, delete the path from `this.data`. */
    if(value === undefined) {
      changeType = 'delete';
      pie.object.deletePath(this.data, key);

    /* Otherwise, we set the value within `this.data`. */
    } else {
      pie.object.setPath(this.data, key, value);
      changeType = changeType || 'add';
    }

    if(parentKeys && parentKeys.length) {
      var parentVal;

      for(i = 0; i < parentKeys.length; i++) {

        parentVal = this.get(parentKeys[i]);

        if(changeType === 'delete' && pie.object.isObject(parentVal) && pie.object.isEmpty(parentVal)) {
          this.set(parentKeys[i], undefined, nestedOpts);
        } else {
          this.addChangeRecord(parentKeys[i], 'pathUpdate', undefined, undefined);
        }
      }
    }

    /* Add the change to the `changeRecords`. */
    this.addChangeRecord(changeName, changeType, changeOldValue, changeValue);


    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords(options);
  },

  // ** pie.model.setData **
  //
  // Update data to contain only the keys defined by obj.
  // Results in the same data value as a `reset` + `sets` BUT change records will reflect
  // the updates, not the removal + the additions.
  //
  // ```
  // model.setData({foo: 'bar', bar: 'baz'})
  // model.setData({bar: 'foo'})
  // //=> change records will include a deleted foo, and an updated bar.
  // model.data
  // //=> {__version: 3, bar: 'foo'}
  // ```
  setData: function(obj, options) {
    var existing = Object.keys(pie.object.flatten(this.data)),
    given = Object.keys(pie.object.flatten(obj)),
    removed = pie.array.subtract(existing, given),
    rmOptions = pie.object.merge({}, options, {skipObservers: true});

    removed = pie.array.remove(removed, '__version');

    removed.forEach(function setDataRemover(rm){
      this.set(rm, undefined, rmOptions);
    }.bind(this));

    return this.sets(obj, options);
  },

  // ** pie.model.sets **
  //
  // Set a bunch of stuff at once.
  // Change records will not be delivered until all keys have been set.
  // ```
  // model.sets({foo: 'bar', baz: 'qux'}, {skipObservers: true});
  // ```
  sets: function(obj, options) {
    var innerOpts = pie.object.merge({}, options, {skipObservers: true});
    pie.object.forEach(obj, function setsIterator(k,v) {
      this.set(k, v, innerOpts);
    }.bind(this));

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords(options);
  },

  // ** pie.model.test **
  //
  // Test a `value` against the value at `path`.
  // If `value` is a regular expression it will stringify the path's value and test against the regex.
  // ```
  // model.test('foo', 'bar');
  // model.test('firstName', 'Douglas');
  // model.test('firstName', /doug/i);
  // ```
  test: function(path, value) {
    var owned = this.get(path);
    if(owned === value) return true;
    else if(owned == null) return false;
    else if (pie.object.isRegExp(value)) return value.test(String(owned));
    else return false;
  },

  tests: function(obj) {
    for(var k in obj) {
      if(!this.test(k, obj[k])) return false;
    }
    return true;
  },

  // ** pie.model.touch **
  //
  // Bumps the __version by 1 and delivers change records to observers of __version
  // ```
  // model.touch();
  // ```
  touch: function() {
    this.trackVersion();
    this.deliverChangeRecords({skipVersionTracking: true});
  },

  // ** pie.model.trackVersion **
  //
  // Increment the `__version` of this model.
  // Observers are skipped since this is invoked while change records are delivered.
  trackVersion: function() {
    var oldVal = this.data.__version,
    newVal = oldVal + 1;
    this.data.__version = newVal;
    this.addChangeRecord('__version', 'update', oldVal, newVal);
    return this;
  },

  // ** pie.model.unobserve **
  //
  // Unregister an observer. Optionally for specific keys.
  // If a subset of the original keys are provided it will only unregister
  // for those provided.
  unobserve: function(/* fn1[, fn2, fn3[, key1, key2, key3]] */) {
    var args = pie.array.change(arguments, 'from', 'flatten'),
    part = pie.array.partition(args, pie.object.isFunction),
    fns = part[0],
    keys = part[1],
    observation,
    cnt;

    keys.forEach(function observedKeyCountDecrementer(k) {
      cnt = this.observedKeyCounts[k];
      if(cnt) this.observedKeyCounts[k] = cnt - 1;
    }.bind(this));

    fns.forEach(function observerRemoverer(fn){
      pie.uid(fn);

      observation = this.observations[pie.uid(fn)];
      if(!observation) return;

      if(!keys.length) {
        delete this.observations[pie.uid(fn)];
        return;
      }

      observation.keys = pie.array.subtract(observation.keys, keys);

      if(!observation.keys.length) {
        delete this.observations[pie.uid(fn)];
        return;
      }
    }.bind(this));

    return this;
  },
});
// # Pie Config
// A place to store app configuration information.
// It allows for dynamic subconfigs to be defined as well.
//
// ```
// app.config.set('googleMapsKey', 'xyz');
// app.config.dynamic('env', {
//   "defaults" : {
//     analyticsEnabled: false
//   },
//   "production" : {
//     analyticsEnabled: true
//   }
// });
//
// app.config.get('googleMapsKey')
// //=> 'xyz'
//
// app.config.get('analyticsEnabled');
// //=> false
//
// app.config.set('env', 'production');
// app.config.get('analyticsEnabled');
// //=> true
// ```
pie.config = pie.model.extend('config', {

  init: function(app, options) {
    options = options || {};
    options.app = app;

    this._super({}, options);
    this.dynamicKeys = {};
  },

  _onDynamicChange: function(dynamic) {
    var val = this.get(dynamic),
    defaults, conf;

    defaults = this.get(dynamic + 'Config.defaults');
    conf = val && this.get(dynamic + 'Config.' + val);

    this.sets(pie.object.deepMerge({}, defaults, conf));
  },

  dynamic: function(dynamic, obj) {
    var current = this.get(dynamic + 'Config') || {};
    this.set(dynamic + 'Config', pie.object.deepMerge(current, obj));

    if(!this.dynamicKeys[dynamic]) {
      this.dynamicKeys[dynamic] = true;
      this.observe(function(){
        this._onDynamicChange(dynamic);
      }.bind(this), dynamic);
    }

    this._onDynamicChange(dynamic);
  }

});
pie.cache = pie.model.extend('cache', {

  fetch: function(path, fn) {
    var value = this.get(path);
    if(value !== undefined) return value;
    value = pie.fn.valueFrom(fn);
    this.set(path, value);
    return value;
  }

});
pie.dataStore = pie.base.extend('dataStore', {

  init: function(app, options) {
    this.app = app;
    this.options = pie.object.merge({
      primary: 'sessionStorage',
      backup: 'backup'
    }, options);

    this._super();

    this.backupModel = pie.model.create({});
  },

  primary: function() {
    return this._store(this.options.primary);
  },

  backup: function() {
    return this._store(this.options.backup);
  },

  _store: function(name) {
    if(pie.object.isString(name)) return pie.dataStore.adapters[name];
    else return name;
  },


  clear: function(key) {
    this.primary().clear(key, this);
    this.primary().clear(key, this);
  },

  get: function(key, options) {
    var result = this.primary().get(key, this);
    if(result === pie.dataStore.ACCESS_ERROR) result = this.backup().get(key, this);

    if(!options || (options.clear === undefined || options.clear)) {
      this.clear(key);
    }

    return result;
  },

  set: function(key, value) {
    // clear from all stores so we don't get out of sync.
    this.clear(key);

    var result = this.primary().set(key, value, this);
    if(result === pie.dataStore.ACCESS_ERROR) result = this.backup().set(key, value, this);

    return result;
  }

});

pie.dataStore.ACCESS_ERROR = new Error("~~PIE_ACCESS_ERROR~~");
pie.dataStore.adapters = (function(){

  var storageGet = function(storeName, key) {

    try {
      if(!window[storeName]) return pie.dataStore.ACCESS_ERROR;

      var encoded = window[storeName].getItem(key);
      return encoded != null ? JSON.parse(encoded) : encoded;
    } catch(err) {
      this.app.errorHandler.reportError(err, {
        handledBy: "pie.dataStore." + storeName + "#get",
        key: key
      });

      return pie.dataStore.ACCESS_ERROR;
    }
  };

  var storageSet = function(storeName, key, value) {

    var str;

    try {
      if(!window[storeName]) return pie.dataStore.ACCESS_ERROR;

      str = JSON.stringify(value);
      window[storeName].setItem(key, str);

      return true;
    } catch(err) {
      this.app.errorHandler.reportError(err, {
        handledBy: "pie.dataStore." + storeName + "#get",
        key: key,
        data: str
      });

      return pie.dataStore.ACCESS_ERROR;
    }
  };

  var storageClear = function(storeName, key) {
    try {
      if(!window[storeName]) return pie.dataStore.ACCESS_ERROR;
      window[storeName].removeItem(key);
    } catch(err) {
      this.app.errorHandler.reportError(err, {
        handledBy: "pie.dataStore." + storeName + "#clear",
        key: key
      });

      return pie.dataStore.ACCESS_ERROR;
    }
  };

  return {

    sessionStorage: {

      clear: function(key, parentStore) {
        return storageClear.call(parentStore, 'sessionStorage', key);
      },

      get: function(key, parentStore) {
        return storageGet.call(parentStore, 'sessionStorage', key);
      },
      set: function(key, value, parentStore) {
        return storageSet.call(parentStore, 'sessionStorage', key, value);
      }
    },

    localStorage: {

      clear: function(key, parentStore) {
        return storageClear.call(parentStore, 'localStorage', key);
      },

      get: function(key, parentStore) {
        return storageGet.call(parentStore, 'localStorage', key);
      },
      set: function(key, value, parentStore) {
        return storageSet.call(parentStore, 'localStorage', key, value);
      }

    },

    cookie: {

      clear: function(key) {
        try {
          return pie.browser.setCookie(key, null);
        } catch(e) {
          return pie.dataStore.ACCESS_ERROR;
        }
      },

      get: function(key) {
        try {
          var json = pie.browser.getCookie(key);
          return json != null ? JSON.parse(json) : json;
        } catch(e) {
          return pie.dataStore.ACCESS_ERROR;
        }
      },

      set: function(key, value) {
        try{
          var json = JSON.stringify(value);
          pie.browser.setCookie(key, json);
        } catch(e) {
          return pie.dataStore.ACCESS_ERROR;
        }
      }

    },

    backup: {

      clear: function(key, parentStore) {
        parentStore.backupModel.set(key, undefined);
      },

      get: function(key, parentStore) {
        parentStore.backupModel.get(key);
      },

      set: function(key, value, parentStore) {
        parentStore.backupModel.set(key, value);
      }

    }
  };
})();
// # Pie View
//
// Views are objects which wrap and interact with DOM. They hold reference to a single element via `this.el`. All
// event obsrevation, delegation, and querying is conducted within the scope of the view's `el`.
//
// Views are equipped with an emitter. The emitter can be utilized for observing any type of lifecycle activity.
// View lifecycle:
//   * init - the constructor
//   * setup - if `setup: true` is provided to the constructor this will happen immediately after instantiation, otherwise this needs to be invoked.
//   * attach - the stage in which the view's el is added to the DOM.
//   * user interaction
//   * teardown - removes any added events from the dom elements, removes any model observations, removes the el from the dom, etc.
//   * detach - when the view's el is removed from the DOM.
pie.view = pie.base.extend('view', {

  __pieRole: 'view',

  // **pie.view.init**
  //
  // Options:
  //   * el - (optional) the root element of the views control. if not provided, a new <div> will be created. `el` can be provided as an object. The tagName attribute will be use
  //   * app - (optional) the app this view is associated with.
  //   * uiTarget - (optional) element to attach to. if provided, after this view is set up it will automatically attach this element.
  //   * setup - (option) if truthy, this view's setup function will be called directly after initialization.
  init: function(options) {
    this.options = options || {},
    this.app = this.options.app || pie.appInstance;

    if(pie.object.isPlainObject(this.options.el)) {
      this.el = document.createElement(this.options.el.tagName || 'div');
      for(var key in this.options.el) {
        if(key !== 'tagName') {
          if(key === 'classes') {
            pie.dom.addClass(this.el, this.options.el[key]);
          } else this.el.setAttribute(key, this.options.el[key]);
        }
      }
    } else {
      this.el = this.options.el || document.createElement('div');
    }

    this.eventedEls = [];
    this.changeCallbacks = {};

    this.emitter = pie.emitter.create();

    if(this.options.uiTarget) {
      this.eonce('setup:after', this.addToDom.bind(this));
    }

    this._super();
  },

  // **pie.view.addedToParent**
  //
  // Accommodates the `addedToParent` hook event in pie.container.
  // Emits the event via the emitter, meaning this can be subscribed to in the init or setup process.
  addedToParent: function() {
    this.emitter.fire('addedToParent');
  },

  // **pie.view.addToDom**
  //
  // A function which adds the view's el to the DOM within target (or this.options.uiTarget).
  // An "attach" sequence is fired so views can control how they enter the DOM.
  // By default the element will be appended, if `prependInstead` is true the element will be
  // prepended. If preprendInstead is an element, the child will be prepended before target.
  addToDom: function(target, prependInstead) {
    target = target || this.options.uiTarget;
    if(target !== this.el.parentNode) {
      this.emitter.fireSequence('attach', function viewAttach(){
        if(prependInstead === true && target.firstChild) target.insertBefore(this.el, target.firstChild);
        else if(prependInstead && prependInstead !== true) target.insertBefore(this.el, prependInstead);
        else target.appendChild(this.el);
      }.bind(this));
    }
  },

  // **pie.view.consumeEvent**
  //
  // A utility method for consuming an event, and optionally immediately stopping propagation.
  // ```
  // clickCallback: function(e) {
  //   this.consumeEvent(e);
  //   console.log(e.delegateTarget.href);
  // }
  // ```
  consumeEvent: function(e, immediate) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
      if(immediate) e.stopImmediatePropagation();
    }
  },

  // **pie.view.eon**
  //
  // Register an event with the emitter.
  eon: function() {
    var args = this._normalizedEmitterArgs(arguments, 1);
    return this.emitter.on.apply(this.emitter, args);
  },

  // **pie.view.eoff**
  //
  // Unregister an event from the emitter.
  eoff: function(uid) {
    return this.emitter.off(uid);
  },

  // **pie.view.eonce**
  //
  // Register an event once with the emitter.
  eonce: function() {
    var args = this._normalizedEmitterArgs(arguments, 1);
    this.emitter.once.apply(this.emitter, args);
  },

  ewait: function() {
    var args = this._normalizedEmitterArgs(arguments, arguments.length-1);
    this.emitter.waitUntil.apply(this.emitter, args);
  },

  eprepend: function() {
    var args = this._normalizedEmitterArgs(arguments, 1);
    this.emitter.prepend.apply(this.emitter, args);
  },

  eprependonce: function() {
    var args = this._normalizedEmitterArgs(arguments, 1);
    this.emitter.prependOnce.apply(this.emitter, args);
  },

  _normalizedEmitterArgs: function(args, fnStartIdx) {
    return pie.array.from(args).map(function(arg, i) {
      if(pie.object.isString(arg) && i >= fnStartIdx) return this[arg].bind(this);
      return arg;
    }.bind(this));
  },

  // **pie.view.eventNamespace**
  //
  // The namespace used for this view's events. All views have a separate namespace to ensure
  // event triggers are propagated efficiently.
  eventNamespace: function() {
    return 'view'+ pie.uid(this);
  },


  // **pie.view.on**
  //
  // Observe a dom event and invoke the provided functions.
  // By default all events are delegated to this.el, but if you pass in an element as the last argument
  // that will be used. If the functions are provided as strings, they will be looked up on `this`.
  //
  // ```
  // view.on('click', 'a', this.handleClick.bind(this), this.trackClickEvent.bind(this));
  // view.on('submit', 'form', 'handleSubmit');
  // view.on('resize', null, 'onResize', window);
  // ```
  on: function(/* e, sel, f1, f2, f3, el */) {
    var fns = pie.array.from(arguments),
        events = fns.shift(),
        sel = fns.shift(),
        ns = this.eventNamespace(),
        f2, el;

    el = pie.object.isDom(pie.array.last(fns)) ? fns.pop() : this.el;

    if(!~this.eventedEls.indexOf(el)) this.eventedEls.push(el);

    events = events.split(' ');

    fns.forEach(function viewOnIterator(fn) {
      fn = pie.object.isString(fn) ? this[fn].bind(this) : fn;

      f2 = function viewEventNamespaceVerifier(e){
        if(e.namespace === ns) {
          return fn.apply(this, arguments);
        }
      };

      events.forEach(function viewOnSubscriber(ev) {
        ev += "." + ns;
        pie.dom.on(el, ev, f2, sel);
      }.bind(this));

    }.bind(this));

    return this;
  },


  // **pie.view.observe**
  //
  // Observe changes of a model, unobserving them when the view is removed.
  // If the object is not observable, an error will be thrown.
  // The first argument is the observable model OR the function to be executed.
  // If the first argument is not a model, the model will be assumed to be `this.model`.
  // The next arguments (first or second) should be a function name or a function.
  // The remaining arguments are optional filter keys.
  // ```
  // view.observe(user, this.onNameChange.bind(this), 'firstName', 'lastName');
  // view.observe(context, this.onContextChange.bind(this));
  // ```
  observe: function() {
    var args = pie.array.from(arguments),
    observable = pie.object.isModel(args[0]) ? args.shift() : this.model;

    if(!pie.object.has(observable, 'observe', true)) throw new Error("Observable does not respond to observe");

    if(pie.object.isString(args[0])) args[0] = this[args[0]].bind(this);

    var callback = {
      observable: observable,
      args: args
    };

    var uid = pie.uid(callback);

    this.changeCallbacks[uid] = callback;

    observable.observe.apply(observable, args);

    return uid;
  },

  unobserve: function(uid) {
    var a = this.changeCallbacks[uid];
    delete this.changeCallbacks[uid];
    a.observable.unobserve.apply(a.observable, a.args);
  },

  onChange: function() {
    this.app.debug.apply(this.app, pie._debugArgs("view#onChange is deprected. Please use view#observe instead."));
    this.observe.apply(this, arguments);
  },


  // **pie.view.qs**
  //
  // Shortcut for this.el.querySelector
  qs: function(selector) {
    return this.el.querySelector(selector);
  },


  // **pie.view.qsa**
  //
  // shortcut for this.el.querySelectorAll
  qsa: function(selector) {
    return this.el.querySelectorAll(selector);
  },

  // **pie.view.removeFromDom**
  //
  // Assuming the view's el is in the DOM, a detach sequence will be invoked, resulting in the el being removed.
  // Note we don't use pie.dom.remove since we know we're cleaning up our events. Multiple views could be associated
  // with the same el.
  removeFromDom: function() {
    if(this.el.parentNode) {
      this.emitter.fireSequence('detach', function viewDetach() {
        this.el.parentNode.removeChild(this.el);
      }.bind(this));
    }
  },

  // **pie.view.removedFromParent**
  //
  // Accommodates the `removedFromParent` hook event in pie.container.
  // It emits a `removedFromParent` event which can be observed in the setup process.
  removedFromParent: function() {
    this.emitter.fire('removedFromParent');
  },

  // **pie.view.setup**
  //
  // Placeholder for default functionality.
  // By default, the setup event is triggered on the emitter.
  setup: function(){
    this.emitter.fireSequence('setup');
    return this;
  },

  // **pie.view.cancelSetup**
  //
  // Sometimes when a view is being set up it determines that the app has to redirect and/or it's
  // no longer relevant to the page. If you do not conduct a full setup process this function will
  // short circuit the process.
  cancelSetup: function() {
    this.emitter.fire('setup:after');
    return this;
  },

  // **pie.view.teardown**
  //
  // This function should be invoked when it's ready to dismiss the view.
  // Upon invocation, a `teardown` sequence is emitted.
  // When teardown runs, the view's `el` is removed from the dom, all observations are removed,
  // and all children have teardown invoked.
  teardown: function() {

    this.emitter.fireSequence('teardown', function viewTeardown() {

      this.removeFromDom();

      this._unobserveEvents();
      this._unobserveChangeCallbacks();

      this.teardownChildren();
      /* views remove their children upon removal to ensure all irrelevant observations are cleaned up. */
      this.removeChildren();

    }.bind(this));

    return this;
  },

  // **pie.view.teardownChildren**
  //
  // Invokes teardown on each child that responds to it.
  teardownChildren: function() {
    this.children.forEach(function viewChildrenTeardown(child) {
      if(pie.object.has(child, 'teardown', true)) child.teardown();
    });
  },

  /* release all observed events. */
  _unobserveEvents: function() {
    var key = '*.' + this.eventNamespace();
    this.eventedEls.forEach(function(el) {
      pie.dom.off(el, key);
    });
  },

  /* release all change callbacks. */
  _unobserveChangeCallbacks: function() {
    Object.keys(this.changeCallbacks).forEach(this.unobserve.bind(this));
  }

}, pie.mixins.container);


/* true create function overriden to invoke setup after init() is finished if `setup:true` was provided as an option */
(function(){
  var existing = pie.view.create;
  pie.view.create = function() {
    var instance = existing.apply(this, arguments);
    if(instance.options.setup) instance.setup();
    return instance;
  };
})();
pie.activeView = pie.view.extend('activeView', {

  init: function(options) {
    if(pie.object.isString(options)) options = {template: options};
    this._super(options);
    if(!this.model && this.options.model) this.model = this.options.model;
    this.refs = {};
  },

  setup: function() {

    if(this.options.autoRender && this.model) {
      var args = pie.object.isBoolean(this.options.autoRender) ? ['~'] : pie.array.from(this.options.autoRender);
      args.unshift('render');
      args.unshift(this.model);
      this.observe.apply(this, args);
    }

    if(this.options.renderOnSetup || this.options.renderOnSetup === undefined) {
      this.eonce('setup', 'render');
    }

    if(this.options.refs) {
      this.setupRefs();
      this.eprepend('render:after', 'clearRefCache');
    }

    this.eon('render', '_renderTemplateToEl');

    this._super();
  },

  hasChild: function(options) {
    var f = function boundRenderChild(){ return this._renderChild(options); }.bind(this);

    var events = options.events;
    if(events === undefined) events = ['render:after'];

    pie.array.from(events).forEach(function(e){
      this.eon(e, f);
    }.bind(this));
    return f;
  },

  _renderChild: function(options) {

    if(!this.isInApp()) return;

    var factory = pie.fn.from(options.factory, this),
    transitionClass = options.viewTransitionClass || pie.simpleViewTransition,
    childName = options.name,
    current = this.getChild(childName),
    instance = current,
    target = options.sel,
    filter = pie.fn.from(options.filter, this),
    blocker = pie.fn.from(options.blocker, this),
    info = {
      childName: childName,
      current: this.getChild(childName),
    },
    trans;

    if(pie.object.isString(target)) target = this.qs(target);

    info.target = target;

    // if we have no place to put our view or we've been filtered, remove the current child
    if(!target || (filter && filter() === false)) {

      // if there is a current view, make sure we tear this dude down.
      if(current) {
        this.removeChild(current);
        current.teardown();
      }

      this.emitter.fire(childName + ':teardown', info);
      return;
    }

    this.emitter.fire(childName + ':manage:before', info);

    var aroundTrigger = function(){
      this.emitter.fireAround(childName + ':manage:around', function activeViewRenderChild() {

        instance = factory(current);

        if(!current && !instance) return;

        info.instance = instance;

        // if we are dealing with the same instance, make sure we don't remove it, only add it.
        if(current === instance) {
          // if we're still attached to the previous render, move us to the new one.
          if(!target.contains(current.el)) current.addToDom(target);
          this.emitter.fire(childName + ':manage', info);
          this.emitter.fire(childName + ':manage:after', info);
          return;
        }

        // there's a child and a target.
        trans = transitionClass.create(this, pie.object.merge(options.viewTransitionOptions, {
          targetEl: target,
          childName: childName,
          oldChild: current,
          newChild: instance
        }));


        info.transition = trans;
        this.emitter.fire(childName + ':manage', info);

        trans.transition(function(){
          this.emitter.fire(childName + ':manage:after', info);
        }.bind(this));

      }.bind(this));
    }.bind(this);

    if(blocker) blocker(aroundTrigger);
    else aroundTrigger();
  },

  _renderTemplateToEl: function() {
    var templateName = pie.fn.valueFrom(this.templateName, this);

    if(templateName) {
      this.app.templates.renderAsync(templateName, this.renderData(), function activeViewOnTemplateReady(content){
        this.el.innerHTML = content;
        this.emitter.fire('render:after');
      }.bind(this));
    } else {
      this.emitter.fire('render:after');
    }
  },

  renderData: function() {
    if(this.model) {
      return this.model.data;
    }

    return {};
  },

  render: function() {
    this.emitter.fire('render:before');
    this.emitter.fireAround('render:around', function activeViewRender(){
      // render:after should be fired by the render implementation.
      // There's the possibility that a template needs to be fetched from a remote source.
      this.emitter.fire('render');
    }.bind(this));
  },

  templateName: function() {
    return this.options.template;
  },

  setupRefs: function() {
    var refs = {};
    var self = this;

    Object.defineProperty(refs, '_cache', {
      iteratable: false,
      writable: true
    });

    refs.fetch = function(name){
      delete refs._cache[name];
      return refs[name];
    };

    refs._cache = {};

    pie.object.forEach(self.options.refs, function(k,v) {

      Object.defineProperty(refs, k, {
        iteratable: false,
        get: function() {
          if(pie.object.has(refs._cache, k)) return refs._cache[k];
          return refs._cache[k] = self.qs(v);
        }
      });

    });

    self[self.options.refsName || 'dom'] = refs;
  },

  clearRefCache: function() {
    this[this.options.refsName || 'dom']._cache = {};
  }

});
pie.ajaxRequest = pie.model.extend('ajaxRequest', {

  init: function(data, options) {
    this._super(data, options);

    this.getOrSet('headers', {});

    this.xhr = null;
    this.emitter = pie.emitter.create();

    this.validates({
      url: { presence: true },
      verb: { inclusion: { in: pie.object.values(this.VERBS) }}
    }, null);
  },

  VERBS: {
    del: 'DELETE',
    get: 'GET',
    patch: 'PATCH',
    post: 'POST',
    put: 'PUT'
  },

  _append: function(name, fns, immediate) {
    fns = pie.array.change(fns, 'from', 'flatten');
    fns.forEach(function(fn){
      this.emitter.on(name, fn, {immediate: immediate});
    }.bind(this));
  },

  _onDataSuccess: function(data) {
    this.emitter.fire('dataSuccess', data);
  },

  _onSetModel: function(data) {
    this.emitter.fire('setModel', data);
  },

  _onSuccess: function(data, xhr) {
    this.emitter.fire('success', data, xhr);
  },

  _onComplete: function(xhr) {
    this.emitter.fire('complete', xhr);
  },

  _onError: function(xhr) {
    this.emitter.fire('error', xhr);
    this.emitter.fire('extraError', xhr);
  },

  _onProgress: function(event) {
    this.emitter.fire('progress', event);
  },

  _onUploadProgress: function(event) {
    this.emitter.fire('uploadProgress', event);
  },

  _parseOptions: function(options) {
    if(!options) return;

    options = pie.object.merge({}, options);

    ['setup', 'complete', 'dataSuccess', 'error', 'extraError', 'progress', 'success', 'uploadProgress', 'setModel'].forEach(function(n){
      if(options[n]) {

        pie.array.from(options[n]).forEach(function(fn){
          this[n](fn);
        }.bind(this));

        delete options[n];
      }
    }.bind(this));

    this.sets(options);
  },

  _validateOptions: function() {
    // upcase before we validate inclusion.
    if(this.get('verb')) this.set('verb', this.get('verb').toUpperCase());

    return this.validateAll().catch(function(){
      throw new Error(JSON.stringify(this.get('validationErrors')));
    }.bind(this));
  },

  _applyHeaders: function(xhr) {

    var accept = this.get('accept'),
    contentType = this.get('contentType'),
    headers = this.get('headers'),
    data = this.get('data');

    this._applyCsrfToken(xhr);

    if(accept) {
      headers['Accept'] = accept;
    }

    if(contentType !== false) {

      if(contentType) {
        headers['Content-Type'] = contentType;
      }

      if(!headers['Content-Type']) {
        if(pie.object.isString(data) || pie.object.instanceOf(data, 'FormData')) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        // if we aren't already sending a string, we will encode to json.
        } else {
          headers['Content-Type'] = 'application/json';
        }
      }

    }

    if(!headers['X-Requested-With']) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    pie.object.forEach(headers, function(k,v) {
      xhr.setRequestHeader(k, v);
    });

  },

  _applyCsrfToken: function(xhr) {

    var token = pie.fn.valueFrom(this.get('csrfToken')) || this.app.cache.fetch('csrfToken', function(){
      var el = pie.qs('meta[name="csrf-token"]');
      return el ? el.getAttribute('content') : null;
    });

    if(token) {
      xhr.setRequestHeader('X-CSRF-Token', token);
    }
  },

  _parseResponse: function(xhr) {
    var accept = this.get('accept'),
    parser = accept && this.responseParsers[accept] || this.responseParsers.default;
    xhr.data = this.response = parser.call(this, xhr);
  },

  responseParsers: {

    "application/json" : function(xhr) {
      try{
        return xhr.responseText.trim().length ? JSON.parse(xhr.responseText) : {};
      } catch(err) {
        this.app.debug.apply(this.app, pie._debugArgs("could not parse JSON response: " + err));
        return {};
      }
    },

    "default" : function(xhr) {
      return xhr.responseText;
    }
  },

  _buildXhr: function() {
    var xhr = new XMLHttpRequest(),
    url = this.get('url'),
    verb = this.get('verb'),
    data = this.get('data'),
    tracker = this.get('tracker'),
    timeout = this.get('timeout'),
    self = this;

    if(verb === this.VERBS.get && data) {
      url = pie.string.urlConcat(url, pie.object.serialize(data));
    }

    url = pie.string.normalizeUrl(url);

    if(this.hasCallback('progress')) {
      xhr.addEventListener('progress', this._onProgress.bind(this), false);
    }

    if(this.hasCallback('uploadProgress')) {
      xhr.upload.addEventListener('progress', this._onUploadProgress.bind(this), false);
    }

    xhr.open(verb, url, true);

    this._applyHeaders(xhr);
    if(timeout) xhr.timeout = timeout;

    this.emitter.fire('setup', xhr, this);


    xhr.onload = function() {
      if(tracker) tracker(xhr, self);

      self._parseResponse(xhr);

      if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
        self._onSetModel(self.response);
        self._onDataSuccess(self.response);
        self._onSuccess(self.response, xhr);
      } else {
        self._onError(xhr);
      }

      self._onComplete(xhr);
    };

    xhr.onerror = xhr.ontimeout = function(){
      self._onError(xhr);
      self._onComplete(xhr);
    };

    this.xhr = xhr;

    this.emitter.fire('xhrBuilt');

    return xhr;
  },

  // Validate the options and build the xhr object.
  // By default, it immediately sends the request.
  // By passing `skipSend = false` you can manage the `send()` invocation manually.
  build: function(options, skipSend) {
    this._parseOptions(options);
    this._validateOptions().then(function(){
      this._buildXhr();
      if(!skipSend) this.send();
    }.bind(this));

    return this;
  },

  // Send the xhr. Assumes build() has been called.
  send: function() {
    var data = this.get('data'), d;

    if(this.get('verb') !== this.VERBS.get) {

      if(pie.object.isString(data) || pie.object.instanceOf(data, 'FormData')) {
        d = data;
      } else {
        d = JSON.stringify(pie.object.compact(data));
      }
    }

    this.xhr.send(d);
    return this;
  },

  // Check if a callback is registered for a specific event.
  hasCallback: function(eventName) {
    return this.emitter.hasCallback(eventName);
  },

  // Register callbacks to be invoked as part of the setup process.
  // Callbacks are provided with the xhr & the request object (this).
  setup: function() {
    this._append('setup', arguments, false);
    return this;
  },

  // Utility method for clearing previous / default events out
  // request.clear('error').error(myErrorHandler);
  clear: function(eventName) {
    this.emitter.clear(eventName);
    return this;
  },

  // Register a callback for when the request is complete.
  complete: function() {
    this._append('complete', arguments, true);
    return this;
  },

  // Register a callback which will only receive the parsed data.
  dataSuccess: function() {
    this._append('dataSuccess', arguments, true);
    return this;
  },

  // Register a callback when the request is unsuccessful.
  // `app.ajax` will provide a default error callback as long as the `error` callbacks are empty.
  // If you would like the default & your error callback, use extraError.
  error: function() {
    this._append('error', arguments, true);
    return this;
  },

  // Register a callback when the request is unsuccessful.
  extraError: function() {
    this._append('extraError', arguments, true);
    return this;
  },

  setModel: function() {
    var fns = pie.array.from(arguments).map(function(m){ return m.sets.bind(m); });
    this._append('setModel', fns, true);
    return this;
  },

  // Register a callback when the request succeeds.
  // Callbacks are invoked with the parsed response & the xhr object.
  success: function() {
    this._append('success', arguments, true);
    return this;
  },

  // Register a callback to be invoked when progress events are triggered from the request.
  progress: function() {
    this._append('progress', arguments, false);
    return this;
  },

  // Register a callback to be invoked when upload progress events are triggered from the request.
  uploadProgress: function() {
    this._append('uploadProgress', arguments, false);
    return this;
  },

  promise: function() {
    if(this._promise) return this._promise;
    this._promise = pie.promise.create(function(resolve, reject) {
      this.dataSuccess(resolve);
      this.error(reject);
    }.bind(this));
    return this._promise;
  }

}, pie.mixins.validatable);
pie.ajax = pie.base.extend('ajax', {

  init: function(app){
    this.app = app;
    this._super();
  },

  defaultAjaxOptions: {
    verb: 'GET',
    accept: 'application/json',
    headers: {}
  },

  _normalizeOptions: function(options) {
    if(pie.object.isString(options)) options = {url: options};
    return options;
  },

  // Interface for conducting ajax requests.
  // Returns a pie.ajaxRequest object
  ajax: function(options, skipSend) {
    options = pie.object.deepMerge({}, this.defaultAjaxOptions, this._normalizeOptions(options));

    var request = pie.ajaxRequest.create({}, { app: this.app });
    request.build(options, skipSend);

    /* add a default error handler if the user hasn't provided one. */
    if(!request.emitter.hasCallback('error')) {
      request.error(this.app.errorHandler.handleXhrError.bind(this.app.errorHandler));
    }

    return request;
  },


  del: function(options, skipSend) {
    options = pie.object.merge({verb: 'DELETE'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  get: function(options, skipSend) {
    options = pie.object.merge({verb: 'GET'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  patch: function(options, skipSend) {
    options = pie.object.merge({verb: 'PATCH'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  post: function(options, skipSend) {
    options = pie.object.merge({verb: 'POST'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  },

  put: function(options, skipSend) {
    options = pie.object.merge({verb: 'PUT'}, this._normalizeOptions(options));
    return this.ajax(options, skipSend);
  }

});
pie.appState = pie.model.extend('appState', {

  infoIgnore: /^__/,

  parseInfo: function(d) {
    var out = {}, r = this.infoIgnore;
    pie.object.forEach(d, function(k,v) {
      if(!r.test(k)) out[k] = v;
    });
    return out;
  },

  thingsThatCareAboutStateChanges: function() {
    return [this.app.router];
  },

  transition: function(id, skipHistory) {

    // no change
    if(this.test('__fullId', id)) return;

    var pq = this.app.pathHelper.pathAndQuery(id);
    var changes = [{}, pq.query];

    this.thingsThatCareAboutStateChanges().forEach(function stateWillChangeIterator(thing) {
      changes.push(thing.stateWillChange(pq.path, pq.query));
    });


    changes = pie.object.merge.apply(null, changes);

    var info = this.parseInfo(changes);

    pie.object.merge(changes, {
      __id: pq.path,
      __query: pq.query || {},
      __fullId: id,
      __history: !skipHistory,
      __info: info
    });


    this.setData(changes);
  }

});
// # Pie Emitter
//
// An emitter is an event subscriber & notifier. It's similar to a pubsub implementation but
// allows for blocking of an event via `around` callbacks. It's similar to a promise implementation,
// but doesn't worry itself with the result of the underlying functions.
// ```
// var emitter = pie.emitter.create();
//
// emitter.on('foo', function(){} );
// emitter.prepend('foo', function(){} );
//
// emitter.once('bar:after', function(){} );
// emitter.prependOnce('bar:before', function(){} );
// emitter.once('bar:around', function(cb){} );
//
// emitter.fire('foo');
// emitter.fireSequence('bar');
// ```
pie.emitter = pie.model.extend('emitter', {

  init: function() {
    this._super({
      triggeredEvents: {},
      eventCallbacks: {}
    });
  },

  // ** pie.emitter.clear **
  //
  // Remove any events registered under `eventName`.
  clear: function(eventName) {
    this.set('eventCallbacks.' + eventName, undefined);
  },

  // ** pie.emitter.hasEvent **
  //
  // Has the event `eventName` been triggered by this emitter yet?
  hasEvent: function(eventName) {
    return !!this.firedCount(eventName);
  },

  // ** pie.emitter.hasCallback **
  //
  // Is there a callback for the event `eventName`.
  hasCallback: function(eventName) {
    var cbs = this.get('eventCallbacks.' + eventName);
    return !!(cbs && cbs.length);
  },

  // ** pie.emitter.firedCount **
  //
  // Count the number of times an event has been triggered
  firedCount: function(eventName) {
    return this.get('triggeredEvents.' + eventName + '.count') || 0;
  },

  lastInvocation: function(eventName) {
    return this.get('triggeredEvents.' + eventName + '.lastArgs') || [];
  },

  // ** pie.emitter.waitUntil **
  //
  // Wait until all `eventNames` have been fired before invoking `fn`.
  // ```
  // emitter.waitUntil('setup:after', 'render:after', this.highlightNav.bind(this));
  // ```
  waitUntil: (function(){

    var invalidEventNameRegex = /:around$/;

    return function(/* eventNames, fn */) {
      var eventNames = pie.array.change(arguments, 'from', 'flatten'),
      fn = eventNames.pop(),
      observers;

      observers = eventNames.map(function(event){
        if(invalidEventNameRegex.test(event)) throw new Error(event + " is not supported by waitUntil.");
        return function(cb) {
          this.once(event, cb, {immediate: true});
        }.bind(this);
      }.bind(this));

      pie.fn.async(observers, fn);
    };
  })(),

  // #### Event Observation

  // ** pie.emitter._on **
  //
  // Append or prepend a function `fn` via `meth` to the callbacks registered under `event`.
  // Options are as follows:
  //
  // * **immediate** - trigger the `fn` immediately if the `event` has been fired in the past.
  // * **onceOnly** - trigger the `fn` a single time then remove the observer.
  //
  // _Note that if `immediate` and `onceOnly` are provided as options and the event has been previously
  // triggered, the function will be invoked and nothing will be added to the callbacks._
  _on: function(event, fn, options, meth) {
    options = options || {};

    if(options.waitUntil) {

      var origFn = fn,
      waitUntil = pie.array.from(options.waitUntil),
      o = pie.object.except(options, 'waitUntil');
      o.immediate = true;

      fn = function() {
        this.waitUntil(waitUntil, function(){
          this._on(event, origFn, o, meth);
        }.bind(this));
      }.bind(this);

      fn.wrapper = true;
    }

    var lastArgs = this.lastInvocation(event);

    if(options.now || (options.immediate && this.hasEvent(event))) {
      fn.apply(null, lastArgs);
      if(options.onceOnly) return;
    }

    var storage = pie.object.merge({fn: fn, event: event}, options);
    var uid = pie.uid(storage);

    this.getOrSet('eventCallbacks.' + event, [])[meth](storage);
    this.get('eventCallbacks')[uid] = storage;

    return uid;
  },

  // Same method signature of `_on`, but handles the inclusion of the `onceOnly` option.
  _once: function(event, fn, options, meth) {
    options = pie.object.merge({onceOnly: true}, options);
    return this._on(event, fn, options, meth);
  },

  // ** pie.emitter.on **
  //
  // Public interface for invoking `_on` & pushing an event to the end of the callback chain.
  // ```
  // emitter.on('foo', function(){});
  // emitter.on('foo:after', function(){});
  // ```
  on: function(event, fn, options) {
    return this._on(event, fn, options, 'push');
  },

  off: function(uid) {
    var storage = this.get('eventCallbacks.' + uid);
    if(!storage) return;
    pie.array.remove(this.get('eventCallbacks.' + storage.event), storage);
    this.set('eventCallbacks.' + uid, undefined);
  },

  // ** pie.emitter.prepend **
  //
  // Public interface for invoking `_on` & prepending an event to the beginning of the callback chain.
  // ```
  // emitter.prepend('foo', function(){});
  // ```
  prepend: function(event, fn, options) {
    return this._on(event, fn, options, 'unshift');
  },

  // ** pie.emitter.once **
  //
  // Public interface for invoking `_once` & pushing an event to the end of the callback chain.
  // ```
  // emitter.once('foo', function(){}, {immediate: true});
  // ```
  once: function(event, fn, options) {
    return this._once(event, fn, options, 'push');
  },

  // ** pie.emitter.prependOnce **
  //
  // Public interface for invoking `_once` & prepending an event to the beginning of the callback chain.
  // ```
  // emitter.prependOnce('foo', function(){});
  // ```
  prependOnce: function(event, fn, options) {
    return this._once(event, fn, options, 'unshift');
  },

  // #### Event Triggering

  // ** pie.emitter._reportTrigger **
  //
  // Increment our `triggeredEvents` counter.
  _reportTrigger: function(event, args) {
    var triggered = this.get('triggeredEvents');
    if(!triggered[event]) triggered[event] = {count: 0};
    triggered[event].lastArgs = args;
    triggered[event].count = triggered[event].count + 1;
  },

  // ** pie.emitter.fire **
  //
  // Trigger an `event` causing any registered callbacks to be fired.
  // Any callbacks associated with that event will be invoked with the arguments supplied by positions 1-N.
  // ```
  // emitter.fire('userSignedUp', 'Doug Wilson');
  // //=> invokes all registered callbacks of the `userSignedUp` event with a single argument, "Doug Wilson".
  // ```
  fire: function(/* event, arg1, arg2, */) {

    var args = pie.array.from(arguments),
    event = args.shift(),
    callbacks = this.get('eventCallbacks.' + event),
    compactNeeded = false;

    /* increment our trigger counters */
    this._reportTrigger(event, args);

    if(callbacks) {
      callbacks.forEach(function emitterFireCallback(cb, i) {
        /* invoke the function for the callback */
        cb.fn.apply(null, args);
        /* if the function is `onceOnly`, clear it out */
        if(cb.onceOnly) {
          compactNeeded = true;
          callbacks[i] = undefined;
        }
      });
    }

    /* if we removed callbacks, clean up */
    if(compactNeeded) this.set('eventCallbacks.' + event, pie.array.compact(callbacks));
  },

  // ** pie.emitter.fireSequence **
  //
  // Fire a sequence of events based on base event name of `event`.
  // Optionally, provide a function `fn` which will be invoked before the base event is fired.
  //
  // ```
  // emitter.fireSequence('foo', barFn);
  // //=> invokes the following sequence:
  // // fires "foo", fires "foo:around", invokes barFn, fires "foo", fires "foo:after"
  // ```
  fireSequence: function(event, fn) {
    var before = event + ':before',
        after  = event + ':after',
        around = event + ':around';

    this.fire(before);
    this.fireAround(around, function emitterFireAroundCallback() {
      if(fn) fn();
      this.fire(event);
      this.fire(after);
    }.bind(this));
  },

  // ** pie.emitter.fireAround **
  //
  // Invokes `event` callbacks and expects each callback to invoke a provided callback when complete.
  // After all callbacks have reported that they're finished, `onComplete` will be invoked.
  // ```
  // cb1 = function(cb){ console.log('cb1!'); cb(); };
  // cb2 = function(cb){ console.log('cb2!'); cb(); };
  // emitter.on('foo:around', cb1);
  // emitter.on('foo:around', cb2);
  // emitter.fireAround('foo:around', function(){ console.log('done!'); });
  // //=> console would log "cb1!", "cb2!", "done!"
  // ```
  fireAround: function(event, onComplete) {
    var callbacks = this.get('eventCallbacks.' + event),
    compactNeeded = false,
    fns;

    this._reportTrigger(event);

    if(callbacks) {
      fns = callbacks.map(function(cb, i) {
        if(cb.onceOnly) {
          compactNeeded = true;
          callbacks[i] = undefined;
        }
        return cb.fn;
      });

      if(compactNeeded) this.set('eventCallbacks.' + event, pie.array.compact(callbacks));

      pie.fn.async(fns, onComplete);
    } else {
      onComplete();
    }
  }

});
// # Pie Error Handler
// A class which knows how to handle errors in the app.
// By default, it focuses mostly on xhr issues.
pie.errorHandler = pie.model.extend('errorHandler', {

  init: function(app) {
    this._super({
      responseCodeHandlers: {}
    }, {
      app: app
    });
  },


  /* extract the "data" object out of an xhr */
  xhrData: function(xhr) {
    return xhr.data = xhr.data || (xhr.status ? JSON.parse(xhr.response) : {});
  },


  // ** pie.errorHandler.errorMessagesFromRequest **
  //
  // Extract error messages from a response. Try to extract the messages from
  // the xhr data diretly, or allow overriding by response code.
  // It will look for an "error", "errors", or "errors.message" response format.
  // ```
  // {
  //   errors: [
  //     {
  //       key: 'invalid_email',
  //       message: "Email is invalid"
  //     }
  //   ]
  // }
  // ```
  errorMessagesFromRequest: function(xhr) {
    var d = this.xhrData(xhr),
    errors = pie.array.from(d.error || d.message || d.errors || []),
    clean;

    errors = errors.map(function(e){ return pie.object.isString(e) ? e : e.message; });

    errors = pie.array.compact(errors, true);
    clean   = this.app.i18n.t('app.errors.' + xhr.status, {default: errors});

    this.app.debug.apply(this.app, pie._debugArgs(errors));

    return pie.array.from(clean);
  },

  getResponseCodeHandler: function(status) {
    return this.get('responseCodeHandlers.' + status);
  },

  // ** pie.errorHandler.handleXhrError **
  //
  // Find a handler for the xhr via response code or the app default.
  handleXhrError: function(xhr) {

    var handler = this.getResponseCodeHandler(xhr.status.toString());

    if(handler) {
      handler.call(xhr, xhr);
    } else {
      this.notifyErrors(xhr);
    }

  },

  handleI18nError: function(error, info) {
    this.reportError(error, info);
  },

  // ** pie.errorHandler.notifyErrors **
  //
  // Build errors and send them to the notifier.
  notifyErrors: function(xhr){
    var n = this.app.notifier, errors = this.errorMessagesFromRequest(xhr);

    if(errors.length) {
      /* clear all previous errors when an error occurs. */
      n.clear('error');

      /* delay so UI will visibly change when the same content is shown. */
      setTimeout(function(){
        n.notify(errors, 'error', 10000);
      }, 100);
    }
  },

  // ** pie.errorHandler.registerHandler **
  //
  // Register a response code handler
  // ```
  // handler.registerHandler('401', myRedirectCallback);
  // handler.registerHandler('404', myFourOhFourCallback);
  // ```
  registerHandler: function(responseCode, handler) {
    this.set('responseCodeHandlers.' + responseCode.toString(), handler);
  },


  // ** pie.errorHandler.reportError **
  //
  // Provide an interface for sending errors to a bug reporting service.
  reportError: function(err, options) {
    options = options || {};

    this._reportError(err, options);
  },

  // ** pie.errorHandler._reportError **
  //
  // Hook in your own error reporting service. bugsnag, airbrake, etc.
  _reportError: function(err, options) {
    options = options || {};

    this.decorateErrorInfo(err, options);

    if (!options.handledBy && window.Bugsnag && window.Bugsnag.notifyException) {
      window.Bugsnag.notifyException(err, options);
    } else {
      this.app.debug.apply(this.app, pie._debugArgs(String(err) + " | " + JSON.stringify(options)));
    }
  },

  handleUnknownError: function(err) {
    if (err instanceof XMLHttpRequest) {
      // show xhr errors to users.
      this.handleXhrError(err);
    }

    if (pie.object.isString(err)) err = new Error(err);
    else if (!(err instanceof Error)) err = new Error(JSON.stringify(err));

    this.reportError(err);

    if (window.console && window.console.error) window.console.error(err);
  },

  decorateErrorInfo: function(error, info) {
    try {
      if (info.handledBy || info.prefix) {
        var prefix = (info.prefix || "[caught]") + " ";

        if (pie.object.has(error, "message", true)) {
          error.message = prefix + error.message;
        }

        if (pie.object.has(error, "name", true)) {
          error.name = prefix + error.name;
        }

        delete info.prefix;
      }
    } catch (e) {}

    try {
      info.pageStructure = app.__tree();
    } catch (e) {}
    try {
      info.pageContext = pie.object.dup(app.pageContext.data, true);
    } catch (e) {}
  },
});
// # Pie FormView
//
// A view designed to ease form modeling & interactions.
// FormViews make use of bindings & validations to simplify the input, validation, and submission of forms.
// FormViews expect the activeView and bindings mixins to be included.
// ```
// myForm = pie.formView.create({
//   fields: [
//     {
//       name: 'full_name'
//       validation: {
//         presence: true
//       }
//     },
//     ...
//     {
//       name: 'terms_of_service',
//       binding: {
//         type: 'check',
//         dataType: 'boolean'
//       },
//       validation: {
//         chosen: true
//       }
//     }
//   ]
// })
// ```
// Valid options are as follows:
//   * **fields** - a list of fields to bind to, validate, and submit. Each field can have the following:
//     * **name** - the name of the field to bind to. Should be the same as the name attribute of the field & the attribute you'd like to submit as.
//     * **binding** - options for the binding. All options present in `pie.bindings#normalizeOptions` are available.
//     * **validation** - options for the validation. All options present in `pie.mixins.validatable` are available.
//   * **ajax** - (optional) an object of ajax options to use as part of the submission. By default it will infer the url & verb from the `<form>` this view contains.
//   * **formSel** - (optional) defaulted to "form", this is the selector which will be observed for submission.
//   * **model** - (optional) a model to be bound to. By default it will create a new model automatically. Keep in mind if you supply a model, the model will have validations applied to it.
//   * **validationStrategy** - (optional) a validation strategy to be applied to the model. See `pie.mixins.validatable` for more info on that.
//
// Upon submission a few things happen. If the ajax call is a success, the view's `onSuccess` function is invoked. The emitter also fires an `onSuccess` event.
// Similarly, upon failure, `onFailure` is invoked & emitted. If you override `ajax.extraError` or `ajax.success` in the options, the associated function & event will not be triggered.
// If you're overriding formView behavior, here's the general process which is taken:
//   1. Upon setup, fields are bound & initialized
//   2. Upon submission, fields are read one final time
//   3. A `submit` event is triggered on our emitter.
//   4. The model is validated.
//   5. If invalid, an `onInvalid` event is fired and the `onInvalid` function is invoked.
//   6. If invalid, an `onValid` event is fired and the `onValid` function is invoked.
//   7. By default, the `onValid` function invokes `prepareSubmissionData` with a callback.
//   8. `prepareSubmissionData` reads the fields out of the model. This is the point when ajax could take place if, say, a token needed to be generated by an external service (I'm talking to you, Stripe).
//   9. When the data is prepared, the callback is invoked.
//   10. The ajax request is made to the form target.
//   11. If unsuccessful, an `onFailure` event & function are triggered.
//   12. If successful, an `onSuccess` event & function are triggered.
pie.formView = pie.activeView.extend('formView', pie.mixins.bindings, {

  init: function() {
    this._super.apply(this, arguments);
    this._ensureModel();
    this._normalizeFormOptions();
  },

  setup: function() {
    this._setupFormBindings();

    this.on('submit', this.options.formSel, this.validateAndSubmitForm.bind(this));

    this._super.apply(this, arguments);
  },

  /* we build a model if one isn't present already */
  /* if the model doesn't know how to perform validations, we extend it with the functionality */
  _ensureModel: function() {
    this.model = this.model || this.options.model || pie.model.create({});
    if(!this.model.validates) this.model.reopen(pie.mixins.validatable);
  },


  _normalizeFormOptions: function() {
    this.options.formSel  = this.options.formSel || 'form';
    this.options.fields   = this.options.fields || [];
    this.options.fields   = this.options.fields.map(function(field) {

      if(pie.object.isString(field)) field = {name: field};

      if(!field || !field.name) throw new Error("A `name` property must be provided for all fields.");

      field.binding = field.binding || {};
      field.binding.attr = field.binding.attr || field.name;

      return field;
    });
  },

  /* These `_on*` methods are provided to enable event observation. */
  /* Implementers of formView should override `on*` methods. */
  _onInvalid: function() {
    this.emitter.fire('onInvalid');
    this.onInvalid.apply(this, arguments);
  },

  _onFailure: function() {
    this.emitter.fire('onFailure');
    this.onFailure.apply(this, arguments);
  },

  _onSuccess: function() {
    this.emitter.fire('onSuccess');
    this.onSuccess.apply(this, arguments);
  },

  _onValid: function() {
    this.emitter.fire('onValid');
    this.onValid.apply(this, arguments);
  },

  _setupFormBindings: function() {
    var validation;

    this.options.fields.forEach(function(field) {
      this.bind(field.binding);

      validation = field.validation || field.validations;

      if(validation) {
        validation = {};
        validation[field.name] = field.validation || field.validations;
        this.model.validates(validation, this.options.validationStrategy);
      }
    }.bind(this));
  },

  /* The ajax options to be applied before submission */
  ajaxOptions: function() {
    return this.options.ajax;
  },

  /* the process of applying form data to the model. */
  applyFieldsToModel: function(/* form */) {
    this.readBoundFields();
  },

  // ** pie.formView.onInvalid **
  //
  // For the inheriting class to override.
  onInvalid: function() {},


  // ** pie.formView.onValid **
  //
  // What happens when the model validations pass.
  // By default, the data is prepared for submission via `prepareSubmissionData`
  // and sent to `performSubmit`.
  onValid: function() {
    this.prepareSubmissionData().then(function onValidDataCallback(data) {

      this.performSubmit(data).then(
        this._onSuccess.bind(this),
        this._onFailure.bind(this)
      );

    }.bind(this));

  },

  // ** pie.formView.performSubmit **
  //
  // By default it builds an ajax request based on `this.options.ajax`
  // and / or the <form> tag identified by `form`.
  // Upon success or failure of the request, the `cb` is invoked with
  // a signature of `cb(success?, responseData)`
  // ```
  // formView.performSubmit(<form>, {foo: 'bar'}, function(isSuccess, data){ console.log(isSuccess, data); });
  // ```
  performSubmit: function(data) {
    var request = app.ajax.ajax(pie.object.merge({
      verb: 'post',
      data: data
    }, this.ajaxOptions()));

    return request.promise();
  },

  /* for the inheriting class to override. */
  onFailure: function(/* response, xhr */) {},

  /* for the inheriting class to override. */
  onSuccess: function(/* response, xhr */) {},

  // ** pie.formView.prepareSubmissionData **
  //
  // The data to be sent to the server.
  // By default these are the defined fields extracted out of the model.
  prepareSubmissionData: function() {
    var fieldNames = pie.array.map(this.options.fields, 'name'),
    data = this.model.gets(fieldNames);

    return pie.promise.resolve(data);
  },

  // ** pie.formView.validateModel **
  //
  // Perform validations on the model & invoke `cb` when complete.
  // By default, `model.validateAll` will be invoked but this can be overridden
  // to talk to external services, etc.
  validateModel: function() {
    return this.model.validateAll();
  },

  // ** pie.formView.validateAndSubmitForm **
  //
  // Start the submission process. We apply our form fields to the model
  // via `applyFieldsToModel`, fire a submit event via our emitter, then
  // begin the validation process via `validateModel`. If the model validates,
  // we invoke our `onValid` function, otherwise the `onInvalid` function.
  validateAndSubmitForm: function(e) {
    this.consumeEvent(e);

    this.applyFieldsToModel();

    this.emitter.fire('submit');

    this.validateModel().then(this._onValid.bind(this), this._onInvalid.bind(this));
  }

});
// # Pie Helpers
// A registry for template helpers.
// Any helper function register here will be available in the
// templates rendered by the associated app's `templates` object.
// ```
// helpers.register('upcase', pie.string.upcase);
// helpers.register('reverse', function(str){
//   return str.split('').reverse().join('');
// });
// ```
// Now, in your templates you'll be able to use these helpers:
// ```
// <h1>[%= h.upcase(data.fullName) %]</h1>
// <p>[%= h.reverse(data.jibberish) %]</p>
// ```
// Note: these do not become global functions but rather are local to each template.
pie.helpers = pie.model.extend('helpers', {

  init: function(app, options) {
    this._super({
      fns: {}
    }, pie.object.merge({
      app: app,
      variableName: 'h'
    }, options));

    var i18n = this.app.i18n;

    this.register('t', i18n.t.bind(i18n));
    this.register('l', i18n.l.bind(i18n));
    this.register('state', this.app.state);
    this.register('timeago', i18n.timeago.bind(i18n));
    this.register('path', this.app.path.bind(this.app));
    this.register('get', pie.object.getPath);
    this.register('render', this.renderPartials.bind(this));
  },

  /* Register a function to be available in templates. */
  register: function(name, fn) {
    return this.set('fns.' + name, fn);
  },

  /* Fetch a helper function */
  fetch: function(name) {
    return this.get('fns.' + name);
  },

  /* Call a helper function */
  call: function(/* name, ..args */) {
    var args = pie.array.from(arguments),
    name = args.shift();

    return this.fetch(name).apply(null, args);
  },

  /* enables render to be called from templates. data can be an object or an array */
  renderPartials: function(templateName, data) {
    return pie.array.map(data, function(d){
      return this.app.templates.render(templateName, d);
    }.bind(this)).join("\n");
  },

  /* Provide the functions which should be available in templates. */
  functions: function() {
    return this.get('fns');
  },

  provideVariables: function() {
    return "var app = pie.apps[" + pie.uid(this.app) + "]; var " + this.options.variableName + " = app.helpers.functions();";

  }

});
// # Pie i18n
// The i18n class is in charge of the defining and lookup of translations, the
// defining and lookup of date formats, and the standardization of "word" things.
// The standard i18n lookup usage is as follows:
//
// ```
// i18n.load({
//   hi: "Hi %{firstName}",
//   followers: {
//     zero: "${hi}, you don't have any followers :(",
//     one: "${hi}, you have a follower!",
//     other: ${hi}, you have %{count} followers!"
// });
//
// i18n.t("hi");
// //=> "Hi undefined"
// i18n.t("hi", {firstName: 'Doug'});
// //=> "Hi Doug"
// i18n.t("hi", {firstName: 'Doug'}, 'upcase');
// //=> "HI DOUG"
// i18n.t("followers", {firstName: 'Doug', count: 5});
// //=> "Hi Doug, you have 5 followers!"
// i18n.t("followers", {firstName: 'Doug', count: 0});
// //=> "Hi Doug, you don't have any followers :("
// ```
// Note that recursive interpolation is allowed via the `${}` identifier. Direct interpolation is
// handled by `%{}`. There is no loop detection so use this wisely.
//
// And date/time usage is as follows:
//
// ```
// i18n.l(date, '%Y-%m');
// //=> "2015-01"
// i18n.l(date, 'isoTime');
// //=> "2015-01-14T09:42:26.069-05:00"
// ```

// _**Todo:** allow a default scope (eg, en, en-GB, etc). Currently the assumption is that only the relevant translations are loaded._
pie.i18n = pie.model.extend('i18n', (function(){

  var extension = {

    init: function(app, options) {
      var data = pie.object.merge({}, pie.i18n.defaultTranslations);
      options = pie.object.deepMerge({
        settings: {
          interpolationStart: '%{',
          interpolationEnd: '}',
          nestedStart: '${',
          nestedEnd: '}'
        }
      }, options || {}, {app: app});


      var escapedInterpEnd = pie.string.escapeRegex(options.settings.interpolationEnd),
      escapedNestedEnd = pie.string.escapeRegex(options.settings.nestedEnd);

      options.settings.interpolationRegex = new RegExp(pie.string.escapeRegex(options.settings.interpolationStart) + '([^' + escapedNestedEnd + ']+)' + escapedInterpEnd, 'g');
      options.settings.nestedRegex = new RegExp(pie.string.escapeRegex(options.settings.nestedStart) + '([^' + escapedNestedEnd + ']+)' + escapedNestedEnd, 'g');

      pie.object.forEach(this.strftimeMods, function(k,v){
        this.strftimeMods[k] = v.bind(this);
      }.bind(this));

      this._super(data, options);
    },

    _ampm: function(num) {
      return this.t('app.time.meridiems.' + (num >= 12 ? 'pm' : 'am'));
    },


    _countAlias: {
      '0' : 'zero',
      '1' : 'one',
      '-1' : 'negone'
    },


    _dayName: function(d) {
      return this.t('app.time.day_names.' + d);
    },


    _hour: function(h) {
      if(h > 12) h -= 12;
      if(!h) h += 12;
      return h;
    },


    _monthName: function(m) {
      return this.t('app.time.month_names.' + m);
    },


    _nestedTranslate: function(t, data) {
      return this._expand(t, this.options.settings.nestedRegex, function(match, path) {
        return this.translate(path, data);
      }.bind(this));
    },

    _interpolateTranslation: function(t, data) {
      return this._expand(t, this.options.settings.interpolationRegex, function(match, key) {
        return pie.object.getPath(data, key);
      });
    },

    _expand: function(t, regex, fn) {
      try{
        var val;
        return t.replace(regex, function(match, key) {
          val = fn(match, key);
          if(val === undefined) throw new Error("Missing interpolation argument `" + key + "` for '" + t + "'");
          return val;
        });
      } catch(e) {
        this.app.errorHandler.handleI18nError(e, {
          handledBy: "pie.i18n#_expand",
          expandString: t,
          regex: regex
        });
        return "";
      }
    },


    /* assumes that dates either come in as dates, iso strings, or epoch timestamps */
    _normalizedDate: function(d) {
      if(String(d).match(/^\d+$/)) {
        d = parseInt(d, 10);
        if(String(d).length < 13) d *= 1000;
        d = new Date(d);
      } else if(pie.object.isString(d)) {
        d = pie.date.timeFromISO(d);
      } else {
        /* let the system parse */
        d = new Date(d);
      }
      return d;
    },


    _shortDayName: function(d) {
      return this.t('app.time.short_day_names.' + d, {'default' : ''}) || this._dayName(d).slice(0, 3);
    },

    _formattedDayName: function(d) {
      if(this._isToday(d)) return this.t('app.time.today');
      if(this._isTomorrow(d)) return this.t('app.time.tomorrow');
      return this._dayName(d.getDay());
    },

    _formattedShortDayName: function(d) {
      if(this._isToday(d)) return this.t('app.time.today');
      return this._shortDayName(d.getDay());
    },

    _isToday: function(date) {
      var now = new Date();
      return now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();
    },

    _isTomorrow: function(date) {
      var tom = new Date();
      tom.setDate(tom.getDate() + 1);
      return tom.getFullYear() === date.getFullYear() &&
        tom.getMonth() === date.getMonth() &&
        tom.getDate() === date.getDate();
    },


    _shortMonthName: function(m) {
      return this.t('app.time.short_month_names.' + m, {'default' : ''}) || this._monthName(m).slice(0, 3);
    },


    _pad: function(num, cnt, pad, prefix) {
      var s = '',
          p = cnt - num.toString().length;
      if(pad === undefined) pad = ' ';
      while(p>0){
        s += prefix ? pad + s : s + pad;
        p -= 1;
      }
      return s + num.toString();
    },

    _ordinal: function(number) {
      var unit = number % 100;

      if(unit >= 11 && unit <= 13) unit = 0;
      else unit = number % 10;

      return this.t('app.time.ordinals.o' + unit);
    },

    _timezoneAbbr: function(date) {
      var str = date && date.toString();
      return str && str.split(/\((.*)\)/)[1];
    },


    _utc: function(t) {
      var t2 = new Date(t.getTime());
      t2.setMinutes(t2.getMinutes() + t2.getTimezoneOffset());
      return t2;
    },

    keyCheck: /^\.(.+)$/,

    // ** pie.i18n.attempt **
    //
    // If the provided `key` looks like a translation key, prepended with a ".",
    // try to look it up. If it does not or the provided key does not exist, return
    // the provided key.
    // ```
    // i18n.attempt('.foo.bar.baz')
    // ```
    attempt: function(/* args */) {
      var args = pie.array.from(arguments),
      key = args[0],
      m = key && key.match(this.keyCheck);

      if(!m) return key;

      args[0] = m[1]; /* swap out the formatted key for the real one */
      return this.translate.apply(this, args);
    },

    // ** pie.i18n.load **
    //
    // Load translations into this instance.
    // By default, a deep merge will occur, provide `false` for `shallow`
    // if you would like a shallow merge to occur.
    // ```
    // i18n.load({foo: 'Bar %{baz}'});
    // ```
    load: function(data, shallow) {
      var f = shallow ? pie.object.merge : pie.object.deepMerge;
      f.call(null, this.data, data);
    },

    // ** pie.i18n.translate (pie.i18n.t) **
    //
    // Given a `path`, look up a translation.
    // If the second argument `data` is provided, the `data` will be
    // interpolated into the translation before returning.
    // Arguments 3+ are string modification methods as defined by `pie.string`.
    // `translate` is aliased as `t`.
    // ```
    // //=> Assuming 'foo.path' is defined as "This is %{name}"
    // i18n.t('foo.path', {name: 'Bar'}, 'pluralize', 'upcase')
    // //=> "THIS IS BAR'S"
    // ```
    translate: function(/* path, data, stringChange1, stringChange2 */) {
      var changes = pie.array.change(arguments, 'from', 'compact'),
      path = changes.shift(),
      data = pie.object.isObject(changes[0]) ? changes.shift() : undefined,
      translation = this.get(path),
      count;

      if (pie.object.has(data, 'count') && pie.object.isObject(translation)) {
        count = (data.count || 0).toString();
        count = this._countAlias[count] || (count > 0 ? 'other' : 'negother');
        translation = translation[count] === undefined ? translation.other : translation[count];
      }

      if(!translation) {

        if(pie.object.has(data, 'default')) {
          var def = pie.fn.valueFrom(data.default);
          if(pie.object.isString(def)) {
            translation = this.attempt(def);
          } else {
            translation = def;
          }
        } else if(translation == null) {
          this.app.errorHandler.handleI18nError(new Error("Translation not found: " + path), {
            handledBy: "pie.i18n#translate",
            translationPath: path
          });
          return "";
        }
      }


      if(pie.object.isString(translation)) {
        translation = translation.indexOf(this.options.settings.nestedStart) === -1 ? translation : this._nestedTranslate(translation, data);
        translation = translation.indexOf(this.options.settings.interpolationStart) === -1 ? translation : this._interpolateTranslation(translation, data);
      }

      if(changes.length) {
        changes.unshift(translation);
        translation = pie.string.change.apply(null, changes);
      }

      return translation;
    },

    // ** pie.i18n.timeago **
    //
    // Return a human representation of the time since the provided time `t`.
    // You can also pass an alternate "relative to" time as the second argument.
    // ```
    // d.setDate(d.getDate() - 4);
    // i18n.timeago(d)
    // //=> "4 days ago"
    //
    // d.setDate(d.getDate() - 7);
    // i18n.timeago(d)
    // //=> "1 week ago"
    //
    // d.setDate(d.getDate() - 90);
    // d2.setDate(d.getDate() + 2);
    // i18n.timeago(d, d2)
    // //=> "2 days ago"
    // ```
    timeago: function(t, now, scope) {
      var tD = t,
      nowD = now,
      diff, c;

      t = this._normalizedDate(t).getTime()  / 1000;
      now = this._normalizedDate(now || new Date()).getTime() / 1000;

      diff = now - t;

      scope = scope || 'app';

      if(diff < 60) { // less than a minute
        return this.t(scope + '.timeago.now', {count: diff});
      } else if (diff < 3600) { // less than an hour
        c = Math.floor(diff / 60);
        return this.t(scope + '.timeago.minutes', {count: c});
      } else if (diff < 86400) { // less than a day
        c = Math.floor(diff / 3600);
        return this.t(scope + '.timeago.hours', {count: c});
      } else if (diff < 86400 * 7) { // less than a week
        c = Math.floor(diff / 86400);
        return this.t(scope + '.timeago.days', {count: c});
      } else if (diff < 86400 * 30) { // less than 30 days
        c = Math.floor(diff / (86400 * 7));
        return this.t(scope + '.timeago.weeks', {count: c});
      } else if (diff < 86500 * 365) { // less than 365 days
        c = (nowD.getFullYear() - tD.getFullYear()) * 12;
        c -= tD.getMonth();
        c += nowD.getMonth();
        return this.t(scope + '.timeago.months', {count: c});
      } else {
        c = Math.floor(diff / (86400 * 365));
        return this.t(scope + '.timeago.years', {count: c});
      }
    },

    // ** pie.i18n.strftime (pie.i18n.l) **
    //
    // Given a `date`, format it based on the format `f`.
    // The format can be:
    //   * A named format, existing at app.time.formats.X
    //   * A custom format following the guidelines of ruby's strftime
    //
    // *Ruby's strftime: http://ruby-doc.org/core-2.2.0/Time.html#method-i-strftime*
    //
    // ```
    // i18n.l(date, 'shortDate');
    // i18n.l(date, '%Y-%m');
    // ```
    strftime: function(date, f) {
      this._date = this._normalizedDate(date);

      /* named format from translations.time. */
      if(!~f.indexOf('%')) f = this.t('app.time.formats.' + f, {"default" : f});

      pie.object.forEach(this.strftimeMods, function(pattern, fn) {
        f = f.replace(pattern, fn);
      });

      delete this._date;
      return f;
    },

    strftimeMods: {
      '%a'   : function(){  return this._shortDayName(this._date.getDay()); },
      '%-a'  : function() { return this._formattedShortDayName(this._date, this._date.getDay()); },
      '%A'   : function() { return this._dayName(this._date.getDay()); },
      '%-A'  : function() { return this._formattedDayName(this._date, this._date.getDay()); },
      '%B'   : function() { return this._monthName(this._date.getMonth()); },
      '%b'   : function() { return this._shortMonthName(this._date.getMonth()); },
      '%d'   : function() { return this._pad(this._date.getDate(), 2, '0'); },
      '%-d'  : function() { return this._date.getDate(); },
      '%+d'  : function() { return this._date.getDate() + this._ordinal(this._date.getDate()); },
      '%e'   : function() { return this._pad(this._date.getDate(), 2, ' '); },
      '%H'   : function() { return this._pad(this._date.getHours(), 2, '0'); },
      '%-H'  : function() { return this._date.getHours(); },
      '%k'   : function() { return this._pad(this._date.getHours(), 2, ' '); },
      '%-k'  : function() { return this._date.getHours(); },
      '%I'   : function() { return this._pad(this._hour(this._date.getHours()), 2, '0'); },
      '%l'   : function() { return this._hour(this._date.getHours()); },
      '%m'   : function() { return this._pad(this._date.getMonth() + 1, 2, '0'); },
      '%-m'  : function() { return this._date.getMonth() + 1; },
      '%M'   : function() { return this._pad(this._date.getMinutes(), 2, '0'); },
      '%p'   : function() { return this._ampm(this._date.getHours()).toUpperCase(); },
      '%P'   : function() { return this._ampm(this._date.getHours()); },
      '%S'   : function() { return this._pad(this._date.getSeconds(), 2, '0'); },
      '%-S'  : function() { return this._date.getSeconds(); },
      '%L'   : function() { return this._pad(this._date.getMilliseconds(), 3, '0'); },
      '%-L'  : function() { return this._date.getMilliseconds(); },
      '%w'   : function() { return this._date.getDay(); },
      '%y'   : function() { return this._pad(this._date.getFullYear() % 100, 2, '0'); },
      '%Y'   : function() { return this._date.getFullYear(); },
      '%Z'   : function() { return this._timezoneAbbr(this._date); },
      '%z'   : function() {
        var offset = this._date.getTimezoneOffset();
        var absOffsetHours    = Math.floor(Math.abs(offset / 60));
        var absOffsetMinutes  = Math.abs(offset) - (absOffsetHours * 60);
        return (offset > 0 ? "-" : "+") + this._pad(absOffsetHours, 2, '0') + this._pad(absOffsetMinutes, 2, '0');
      },
      '%:z' : function() {
        var tzOffset = this.strftimeMods['%z']();
        return tzOffset.slice(0,3) + ':' + tzOffset.slice(3);
      }
    }
  };

  extension.t = extension.translate;
  extension.l = extension.strftime;

  return extension;
})());

pie.i18n.defaultTranslations = {
  app: {
    sentence: {
      conjunction: ' and ',
      delimeter: ', '
    },

    timeago: {
      now: "just now",
      minutes: {
        one:    "%{count} minute ago",
        other:  "%{count} minutes ago"
      },
      hours: {
        one:    "%{count} hour ago",
        other:  "%{count} hours ago"
      },
      days: {
        one:    "%{count} day ago",
        other:  "%{count} days ago"
      },
      weeks: {
        one:    "%{count} week ago",
        other:  "%{count} weeks ago"
      },
      months: {
        one:    "%{count} month ago",
        other:  "%{count} months ago"
      },
      years: {
        one:    "%{count} year ago",
        other:  "%{count} years ago"
      }
    },
    time: {
      today: "Today",
      tomorrow: "Tomorrow",
      formats: {
        isoDate:    '%Y-%m-%d',
        isoTime:    '%Y-%m-%dT%H:%M:%S.%L%:z',
        shortDate:  '%m/%d/%Y',
        longDate:   '%B %+d, %Y'
      },
      meridiems: {
        am: 'am',
        pm: 'pm'
      },
      ordinals: {
        o0: "th",
        o1: "st",
        o2: "nd",
        o3: "rd",
        o4: "th",
        o5: "th",
        o6: "th",
        o7: "th",
        o8: "th",
        o9: "th"
      },
      day_names: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      short_day_names: [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ],
      month_names: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      short_month_names: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]
    },

    validations: {

      ccNumber:           "does not look like a credit card number",
      ccSecurity:         "is not a valid security code",
      ccExpirationMonth:  "is not a valid expiration month",
      ccExpirationYear:   "is not a valid expiration year",
      ccExpirationDate:   "is not a valid expiration date",
      chosen:             "must be chosen",
      date:               "is not a valid date",
      email:              "must be a valid email",
      format:             "is invalid",
      inclusion:          "is not a valid value",
      integer:            "must be an integer",
      length:             "length must be",
      number:             "must be a number",
      phone:              "is not a valid phone number",
      presence:           "can't be blank",
      uniqueness:         "is not unique",
      url:                "must be a valid url",

      range_messages: {
        eq:  "equal to %{count}",
        lt:  "less than %{count}",
        gt:  "greater than %{count}",
        lte: "less than or equal to %{count}",
        gte: "greater than or equal to %{count}"
      }
    }
  }
};
// # Pie List
// A model representing a list. Essentially an array wrapper.
// List models provide observation for:
//   * The entire list
//   * Specific indexes
//   * Length of the list
//   * Any other key not related to the list.
// Optionally, a list can provide a `cast` option which it will use
// to cast plain object index values into. `castOptions` can also be supplied
// which will be provided as the second argument to the cast' constructor.
pie.list = pie.model.extend('list', {

  init: function(arrayOrData, options) {
    if(Array.isArray(arrayOrData)) arrayOrData = {items: arrayOrData};
    this._super(arrayOrData, options);
    this.boundChangeObserver = this.onItemChange.bind(this);
    this.data.items = pie.array.from(this.data.items).map(this._cast.bind(this));
  },

  // ** pie.list._cast **
  //
  // Casts a `value` to the option-provided `cast`.
  // The first argument provided to the cast is the object itself, the
  // second is the options-provided castOptions.
  _cast: function(value) {
    var klass = this.options.cast;
    if(klass === true) klass = pie.model;

    if(klass && pie.object.isPlainObject(value)) {
      value = klass.create(value, this.options.castOptions);
    }

    this._observeItem(value);

    return value;
  },

  _observeItem: function(child) {
    if(this.options.observeItems === false) return;
    if(!child.observe) return;

    child.observe(this.boundChangeObserver, '__version');
  },

  _unobserveItem: function(child) {
    if(this.options.observeItems === false) return;
    if(!child || !child.unobserve) return;
    child.unobserve(this.boundChangeObserver, '__version');
  },

  // ** pie.list._normalizeIndex **
  //
  // Converts a potential index into the numeric form.
  // If the index is negative, it should represent the index from the end of the current list.
  // ```
  // // assuming a list length of 3
  // list._normalizeIndex('foo') //=> 'foo'
  // list._normalizeIndex('4') //=> 4
  // list._normalizeIndex(-1) //=> 2
  // ```
  _normalizedIndex: function(wanted) {
    wanted = parseInt(wanted, 10);
    if(!isNaN(wanted) && wanted < 0) wanted += this.data.items.length;
    return wanted;
  },

  // ** pie.list._trackMutations **
  //
  // Track changes to the array which occur during `fn`'s execution.
  _trackMutations: function(options, fn) {

    var oldLength = this.data.items.length,
    newLength;

    fn.call();

    newLength = this.data.items.length;

    if(!options || !options.skipTrackMutations) {
      if(oldLength !== newLength) {
        this.addChangeRecord('length', 'update', oldLength, newLength)
      }

      this.addChangeRecord('items', 'update', this.data.items, this.data.items);
    }

    if(options && options.skipObservers) return this;
    return this.deliverChangeRecords();
  },

  onItemChange: function(changeSet) {
    var item = changeSet[0].object;
    if(!item) return;

    // todo, create a uid based index hash which would make this much faster.
    var idx = this.indexOf(item);
    this.addChangeRecord('items*', 'item:change', item, item, {changes: changeSet, index: idx});

    this.deliverChangeRecords();
  },

  // ** pie.list.forEach **
  //
  // Iterate the list, calling `f` with each item.
  forEach: function(f) {
    return this.get('items').forEach(f);
  },

  map: function(f) {
    return this.get('items').map(f);
  },

  filter: function(f) {
    return this.get('items').filter(f);
  },

  sort: function(f, options) {
    return this._trackMutations(options, function listSort(){

      var items = this.get('items');
      items.sort(f);

      this.addChangeRecord('items', 'reorder', items, items);

    }.bind(this));
  },

  detect: function(fn) {
    return pie.array.detect(this.get('items'), fn);
  },

  // ** pie.list.get **
  //
  // Get an item at a specific index.
  // `key` can be any valid input to `_normalizeIndex`.
  get: function(key) {
    var idx = this._normalizedIndex(key), path;

    if(isNaN(idx)) path = key;
    else path = 'items.' + idx;

    return this._super(path);
  },

  // ** pie.list.indexOf **
  //
  // Find the index of a specific value.
  // Uses the standard array equality check for indexOf.
  indexOf: function(value) {
    return this.get('items').indexOf(value);
  },

  // ** pie.list.insert **
  //
  // Insert `value` at the index specified by `key`.
  // Returns the list.
  insert: function(key, value, options) {
    return this._trackMutations(options, function listInsert(){

      value = this._cast(value);

      var idx = this._normalizedIndex(key);

      this.addChangeRecord('items*', 'item:add', this.data.items[idx], value, {index: idx});

      this.data.items.splice(idx, 0, value);

    }.bind(this));
  },

  // ** pie.list.length **
  //
  // The length of the list.
  length: function() {
    return this.get('items.length');
  },

  // ** pie.list.pop **
  //
  // Pop an item off the end of the list.
  // Returns the item.
  pop: function(options) {
    var l = this.length(), value;

    if(!l) return;

    this._trackMutations(options, function listPop() {

      value = this.data.items.pop();
      this.addChangeRecord('items*', 'item:delete', value, undefined, {index: this.data.items.length});

      this._unobserveItem(value);

    }.bind(this));

    return value;
  },

  // ** pie.list.push **
  //
  // Add an item to the end of the list.
  // Returns the list.
  push: function(value, options) {
    return this._trackMutations(options, function listPush(){

      value = this._cast(value);

      this.addChangeRecord('items*', 'item:add', undefined, value, {index: this.data.items.length});

      this.data.items.push(value);
    }.bind(this));
  },

  // ** pie.list.remove **
  //
  // Remove a specific index from the list.
  // Returns the removed item.
  remove: function(key, options) {

    var value;

    this._trackMutations(options, function listRemove(){
      var idx = this._normalizedIndex(key);

      value = this.data.items[idx];
      this.data.items.splice(idx, 1);

      this._unobserveItem(value);

      this.addChangeRecord('items*', 'item:delete', value, this.data.items[idx], {index: idx});
    }.bind(this));

    return value;
  },

  removeAll: function(fn) {
    if(!fn) {
      this.setItems([]);
      return this;
    }

    var items = this.get('items');
    for(var i = 0; i < items.length; i++) {
      if(fn(items[i])) {
        this.remove(i)
        i--;
      }
    }

    return this;
  },

  // ** pie.list.set **
  //
  // Set an attribute or an index based on `key` to `value`.
  set: function(key, value, options) {
    if(key === 'items') return this.setItems(value, options);

    var idx = this._normalizedIndex(key);

    if(isNaN(idx)) {
      return this._super(key, value, options);
    }

    var innerOptions = pie.object.merge({}, options, {skipTrackMutations: true, skipObservers: true});

    return this._trackMutations(options, function listSet(){

      this.remove(key, innerOptions);

      if(value === undefined) return;

      this.insert(key, value, innerOptions);

    }.bind(this));
  },

  setItems: function(arr, options) {
    arr = arr || [];

    var innerOptions = pie.object.merge({}, options, {
      skipTrackMutations: true,
      skipObservers: true
    });

    return this._trackMutations(options, function listSetItems(){

      while(this.length()) {
        this.pop(innerOptions);
      }

      for(var i = 0; i < arr.length; i++) {
        this.push(arr[i], innerOptions);
      }

    }.bind(this));
  },

  // ** pie.list.shift **
  //
  // Shift an item off the front of the list.
  // Returns the removed item.
  shift: function(options) {
    return this.remove(0, options);
  },

  // ** pie.list.unshift **
  //
  // Insert an item at the beginning of the list.
  unshift: function(value, options) {
    return this.insert(0, value, options);
  }
});
// # Pie ListView
//
// A view mixin for easily managing a series of items. It assumes the activeView mixin has already been applied to your view.
// ```
// list = new pie.listView({
//   template: 'userList',
//   itemOptions: {
//     template: 'userItem'
//   }
// });
// ```
//
// Available options:
// * listOptions
//   * **sel -** the selector within this view's template to append items to. Defaults to "ul, ol, .js-items-container". If no match is found the view's `el` is used.
//   * **loadingClass -** the loading class to be added to the list container while items are being removed, setup, and added. Defaults to "is-loading".
// * itemOptions
//   * **factory -** a function used to generate the item view(s). If none is supplied, an activeView will be constructed with the item data & the parent's renderData as the renderData.
//   * **template -** assuming a substitute factory is not provided, this is the template (name) to apply to the default activeView.
//   * **any option -** any set of option you'd like to pass to your view.
// * emptyOptions
//   * **any option -** these options are identical to the itemOptions.
//
pie.listView = pie.activeView.extend('listView', (function(){

  var viewFactory = function(options, itemData){
    options = pie.object.merge({ model: itemData }, options);
    return pie.activeView.create(options);
  };

  var listChildContainer = pie.base.extend('listChildContainer', pie.mixins.container);

  return {

    init: function() {

      this._super.apply(this, arguments);

      this.options = pie.object.deepMerge({
        listOptions: {
          loadingClass: 'is-loading'
        },
        itemOptions: {
          factory: viewFactory
        },
        emptyOptions: {
          factory: viewFactory
        }
      }, this.options);

      if(!this.options.itemOptions.factory) {
        throw new Error("No view factory provided");
      }

      this.list = this.list || pie.list.create([]);
      this.model = this.model || this.list;

      this.listItems = listChildContainer.create();

      // to ensure bubbling gets to us.
      this.addChild('listItems', this.listItems);
    },

    setup: function() {
      this.observe(this.list, 'manageListUpdates', 'items*', 'items');
      this.observe(this.list, 'manageEmptyItem', 'length');

      this.eon('render:after', 'bootstrapItems');

      this.eon('renderItems:before', function beforeRenderItems(){ this.setListLoadingStyle(true); }.bind(this));
      this.eon('renderItems:after', function afterRenderItems(){ this.setListLoadingStyle(false); }.bind(this));

      this._super.apply(this, arguments);
    },

    findChildByItem: function(item) {
      return this.listItems.getChild(this.childName(item));
    },

    childName: function(item) {
      return 'item-' + pie.uid(item);
    },

    bootstrapItems: function(containerEl) {
      this.emitter.fireSequence('renderItems', function listViewBootstrapItems() {
        var uid, child, containerEl;

        containerEl = containerEl || this.listContainer();

        this.list.forEach(function listViewBootstrapItem(item, i) {
          child = this.findChildByItem(item) || this.buildItemChild(item, i, containerEl);
          child.removeFromDom();
          child.addToDom(containerEl);
        }.bind(this));

        this.manageEmptyItem();
      }.bind(this));
    },

    addItem: function(item, idx, containerEl) {
      containerEl = containerEl || this.listContainer();

      var child = this.buildItemChild(item, idx, containerEl);
      var idx = child._indexWithinParent;
      var nextChild = this.listItems.getChild(idx + 1);

      child.addToDom(containerEl, nextChild && nextChild.el);
    },

    buildItemChild: function(item, idx, containerEl) {
      containerEl = containerEl || this.listContainer();

      var opts = pie.object.dup(this.options.itemOptions),
      factory = pie.fn.from(opts.factory, this),
      child;

      delete opts.factory;

      child = factory(opts, item);

      this.listItems.addChild(this.childName(item), child, idx);
      child.setup();

      return child;
    },

    removeItem: function(item) {
      var child = this.findChildByItem(item);
      if(child) {
        this.listItems.removeChild(child);
        child.teardown();
      }
    },

    manageListUpdates: function(changeSet) {
      this.emitter.fireSequence('renderItems', function listViewManageListUpdates() {

        var containerEl = this.listContainer();

        changeSet.forEach(function(change){
          this.manageListUpdate(change, containerEl);
        }.bind(this));

      }.bind(this));
    },

    manageListUpdate: function(change, containerEl) {
      if(change.type === 'item:add') {
        this.addItem(change.value, change.index, containerEl);
      } else if (change.type === 'item:delete') {
        this.removeItem(change.oldValue);
      } else if (change.type === 'reorder') {
        // blow away our indexes, but don't rebuild our children.
        this.listItems.sendToChildren('removeFromDom');
        // this will find our existing children and add them back into our dom
        this.bootstrapItems(containerEl);
      }
    },

    manageEmptyItem: function() {
      if(this.list.length()) {
        this.removeEmptyItem();
      } else {
        this.addEmptyItem();
      }
    },

    removeEmptyItem: function() {
      var empty = this.getChild("empty");
      if(empty) {
        this.removeChild(empty);
        empty.teardown();
      }
    },

    addEmptyItem: function() {
      var opts = pie.object.dup(this.options.emptyOptions),
      factory = pie.fn.from(opts.factory, this);

      delete opts.factory;

      if(!factory) return;

      var child = factory(opts, {});

      this.addChild('empty', child);
      child.addToDom(this.listContainer());
      child.setup();
    },

    setListLoadingStyle: function(bool) {
      var className = this.options.listOptions.loadingClass;
      if(!className) return;

      this.listContainer().classList[bool ? 'add' : 'remove'](className);
    },

    listContainer: function() {
      var option = this.options.listOptions.sel;
      if(pie.object.isString(option)) option = this.qs(option);
      if(!option) return this.el;
      return option;
    },

    teardownChildren: function() {
      this._super();
      this._super.call(this.listItems);
    }

  };
})());
// # Pie Navigator
// The navigator is in charge of observing browser navigation and updating it's data.
// It's also the place to conduct push/replaceState history changes.
pie.navigator = pie.base.extend('navigator', {

  init: function(app, options) {
    this._super();

    this.app = app;
    this.options = options;

    this.state = this.app.state;

    this.app.emitter.once('start', this.start.bind(this));
  },

  evaluateState: function() {

    if(this.state.test('__fullId', this.browserPath())) return;

    var route = this.state.get('__route');
    if(this.app.routeHandler.canRouteBeHandled(route)) this.softGo();
    else this.hardGo();
  },

  softGo: function() {
    var replace = !this.state.is('__history');
    window.history[replace ? 'replaceState' : 'pushState']({}, document.title, this.state.get('__fullId'));
  },

  hardGo: function() {
    window.location.href = this.state.get('__fullId');
  },

  browserPath: function() {
    return this.app.path(window.location.pathname + window.location.search);
  },

  navigateApp: function() {
    this.app.go(this.browserPath(), true);
  },

  // ** pie.navigator.start **
  //
  // Setup the pushstate observations and get our app's state bootstrapped.
  start: function() {
    // on popstate we trigger a pieHistoryChange event so any other navigator-enabled apps
    pie.dom.on(window, 'popstate', this.navigateApp.bind(this));

    this.state.observe(this.evaluateState.bind(this), '__fullId', '__route');
    this.navigateApp();
  }
});
// # Pie Notifier
// A class which provides an interface for rendering page-level notifications.
// This does only structures and manages the data to be used by a view. This does not impelement
// UI notifications.
pie.notifier = pie.base.extend('notifier', {

  init: function(app, options) {
    this.options = options || {};
    this.app = app || this.options.app || pie.appInstance;
    this.notifications = pie.list.create([], {cast: true});

    this._super();
  },

  // remove all alerts, potentially filtering by the type of alert.
  clear: function(type) {
    var filter = type ? function(m){ return m.test('type', type); } : undefined;
    this.notifications.removeAll(filter);
  },

  // ** pie.notifier.notify **
  //
  // Show a notification or notifications.
  // Messages can be a string or an array of messages.
  // You can choose to close a notification automatically by providing `true` as the third arg.
  // You can provide a number in milliseconds as the autoClose value as well.
  notify: function(messages, type, autoRemove) {
    type = type || 'message';
    autoRemove = this.getAutoRemoveTimeout(autoRemove);

    messages = pie.array.from(messages);
    messages = messages.map(function notifyI18nAttempter(m){ return this.app.i18n.attempt(m); }.bind(this));

    var msg = {
      messages: messages,
      type: type
    };

    msg.id = pie.uid(msg);
    this.notifications.push(msg);

    if(autoRemove) {
      setTimeout(function autoRemoveCallback(){ this.remove(msg.id); }.bind(this), autoRemove);
    }

  },

  getAutoRemoveTimeout: function(timeout) {
    if(timeout === undefined) timeout = true;
    if(timeout && !pie.object.isNumber(timeout)) timeout = 7000;
    return timeout;
  },

  remove: function(msgId) {
    var idx = pie.array.indexOf(this.notifications.get('items'), function(n){ return n.get('id') == msgId; });
    if(~idx) this.notifications.remove(idx);
  }
});
// # Pie Resources
//
// An external resource loader. It specializes in retrieving scripts, stylesheets, and generic ajax content.
// Upon load of the external resource a callback can be fired. Resources can be registered beforehand to make
// development a bit easier and more standardized.
// ```
// resources.define('googleMaps', '//maps.google.com/.../js');
// resources.define('templates', {src: '/my-templates.html', dataSuccess: parseTemplates});
//
// resources.load('googleMaps', 'templates', 'customI18n', function(){
//   google.Maps.doStuff();
// });
// ```
pie.resources = pie.model.extend('resources', {

  // ** pie.resources.init **
  //
  // Provide an app and a source map (shortcut all the `resources.define()` calls).
  // ```
  // pie.resources.create(app, {googleMaps: '//maps.google.com/.../js'});
  // ```
  init: function(app, srcMap) {
    this._super({
      srcMap: srcMap || {},
      loaded: {}
    }, {
      app: app
    });

    pie.object.forEach(function(k,v) {
      this.define(k, v);
    }.bind(this));
  },

  _appendNode: function(node) {
    var target = pie.qs('head');
    target = target || document.body;
    target.appendChild(node);
  },

  _inferredResourceType: function(src) {
    if((/(\.|\/)js(\?|$)/).test(src)) return 'script';
    if((/(\.|\/)css(\?|$)/).test(src)) return 'link';
    if((/\.(png|jpeg|jpg|gif|svg|tiff|tif)(\?|$)/).test(src)) return 'image';
    return 'ajax';
  },

  _normalizeSrc: function(srcOrOptions) {
    var options = typeof srcOrOptions === 'string' ? {src: srcOrOptions} : pie.object.merge({}, srcOrOptions);
    return options;
  },

  // **pie.resources.\_loadajax**
  //
  // Conduct an ajax request and invoke the `resourceOnload` function when complete
  //
  // Options:
  // * **src** - the url of the request
  // * ** * ** - any valid ajax options
  _loadajax: function(options) {
    var ajaxOptions = pie.object.merge({
      verb: 'GET',
      url: options.src
    }, options);

    return this.app.ajax.ajax(ajaxOptions).promise();
  },

  // **pie.resources.\_loadimage**
  //
  // Load an image and invoke `resourceOnload` when complete.
  // Options:
  // * **src** - the url of the image.
  _loadimage: function(options, resourceOnload) {
    return pie.promise.create(function(resolve, reject){
      var img = new Image();
      img.onload = function(){ resolve(pie.object.merge({ img: img }, options)); };
      img.onerror = reject;
      img.src = options.src;
    });

  },

  // **pie.resources.\_loadlink**
  //
  // Adds a `<link>` tag to the dom if the "type" of the resource is "link".
  //
  // Options:
  // * **src** - the url of the resource
  // * **media** - _(optional)_ defaulting to `screen`, it's the media attribute of the `<link>`
  // * **rel** - _(optional)_ defaulting to `stylesheet`, it's the rel attribute of the `<link>`
  // * **contentType** - _(optional)_ defaulting to `text/css`, it's the type attribute of the `<link>`
  //
  // _Note that since `<link>` tags don't provide a callback, the onload happens immediately._
  _loadlink: function(options) {
    var link = document.createElement('link');

    link.href = options.src;
    link.media = options.media || 'screen';
    link.rel = options.rel || 'stylesheet';
    link.type = options.contentType || 'text/css';

    this._appendNode(link);

    /* Need to record that we added this thing. */
    /* The resource may not actually be present yet. */
    return pie.promise.resolve();
  },

  // **pie.resources.\_loadscript**
  //
  // Adds a `<script>` tag to the dom if the "type" is "script"
  //
  // Options:
  // * **src** - the url of the script.
  // * **callbackName** - _(optional)_ the global callback name the loading library will invoke
  // * **noAsync** - _(optional)_ if true, the script will be loaded synchronously.
  _loadscript: function(options) {

    return pie.promise.create(function(resolve, reject) {
      var script = document.createElement('script');

      if(options.noAsync) script.async = false;

      /* If options.callbackName is present, the invoking method self-references itself so it can clean itself up. */
      /* Because of this, we don't need to invoke the onload */
      if(!options.callbackName) {
        var done = false;
        script.onload = script.onreadystatechange = function loadScriptCallback(){
          if(!done && (!this.readyState || this.readyState==='loaded' || this.readyState==='complete')) {
            done = true;
            resolve();
          }
        };

        script.onerror = reject;
      }

      this._appendNode(script);
      script.src = options.src;

    }.bind(this));
  },

  // ** pie.resources.define **
  //
  // Define a resource by human readable `name`. `srcOrOptions` is a url or
  // an options hash as described by the relevant `_load` function.
  // ```
  // resources.define('googleMaps', '//maps.google.com/.../js');
  // ```
  define: function(name, srcOrOptions) {
    var options = this._normalizeSrc(srcOrOptions);
    this.set('srcMap.' + name, options);
  },

  // ** pie.resources.load **
  //
  // Load resources defined by each argument.
  // If the last argument is a function it will be invoked after all resources have loaded.
  // ```
  // resources.load('foo', 'bar', function callback(){});
  // resources.load(['foo', 'bar'], function(){});
  // resources.load('//maps.google.com/.../js');
  // resources.load({src: '/templates.html', dataSuccess: parseTemplates}, function callback(){});
  // ```
  load: function(/* src1, src2, src3, onload */) {
    var sources = pie.array.change(arguments, 'from', 'flatten', 'compact'),
    promises;

    sources = sources.map(this._normalizeSrc.bind(this));

    /* we generate a series of functions to be invoked by pie.fn.async */
    /* each function's responsibility is to invoke the provided callback when the resource is loaded */
    promises = sources.map(function resourceLoadPromiseGenerator(options){

      /* we could be dealing with an alias, so make sure to grab the real source */
      options = this.get('srcMap.' + options.src) || options;

      /* we cache the loading promise on our promises object */
      var promise = this.get('promises.' + options.src);
      var type = options.type || this._inferredResourceType(options.src)

      if(!promise) {
        promise = this['_load' + type](options);

        /* if a global callback name is desired, set it up then tear it down when the promise resolves */
        if(options.callbackName) {
          window[options.callbackName] = promise.resolve.bind(promise);
          promise = promise.then(function(){ delete window[options.callbackName]; });
        }

        this.set('promises.' + options.src, promise);
      }

      return promise;
    }.bind(this));

    return pie.promise.all(promises);
  }
});
// # Pie Route
//
// Represents a route used by the router.
// Routes understand if they match string paths, they know how to extract interpolations from a path,
// and know how to generate a path given some data.
// ```
// r = pie.route.create('/foo/:id');
//
// r.isDirectMatch('/foo/bar')
// //=> false
// r.isMatch('/foo/bar')
// //=> true
//
// r.interpolations('/foo/bar')
// //=> {id: 'bar'}
//
// r.path({id: 'baz', page: 2})
// //=> '/foo/baz?page=2'
// ```
pie.route = pie.model.extend('route', {

  init: function(path, config) {
    var uid = pie.uid(this);

    this._super({
      pathTemplate: pie.string.normalizeUrl(path),
      config: config,
      name: config && config.name || ("route-" + uid)
    });

    this.set('config.name', undefined);

    this.compute('segments',            'pathTemplate');
    this.compute('pathRegex',           'pathTemplate');
    this.compute('hasInterpolations',   'pathTemplate');
    this.compute('weight',              'segments');
  },

  // **pie.route.segments**
  //
  // The pathTemplate split into segments.
  // Since this is a computed property, we only ever have to do this once.
  segments: function() {
    return this.get('pathTemplate').split('/');
  },

  // **pie.route.pathRegex**
  //
  // A RegExp representing the path.
  // Since this is a computed property, we only ever have to do this once.
  pathRegex: function() {
    var t = this.get('pathTemplate');
    t = pie.string.escapeRegex(t);
    t = t.replace(/(:[^\/\?]+)/g,'([^\\/\\?]+)');
    t = t.replace(/(\\\*[^\/]+)/g, '(.*)');
    return new RegExp('^' + t + '$');
  },

  // **pie.route.weight**
  //
  // A weight representing the specificity of the route. It compiles a number as a string
  // based on the type of segment then casts the number as an integer as part of the return statement.
  // Specificity is determined by:
  //   -
  // Since this is a computed property, we only ever have to do this once.
  weight: function() {
    var tmpls = this.get('segments'),
    w = '';

    tmpls.forEach(function(segment){
      if(segment.match(/^:([^\/]+)$/))
        w += '3';
      else if(segment.match(/^\*([^\/]+)$/))
        w += '2';
      else if(segment === '')
        w += '1';
      else
        w += '4';
    });

    return +w;
  },

  hasInterpolations: function() {
    return /[:\*]/.test(this.get('pathTemplate'));
  },

  // **pie.route.interpolations**
  //
  // Under the assumption that the path is already normalized and we've "matched" it,
  // extract the interpolations from `path`. If `parseValues` is true, the values will
  // be parsed based on `pie.string.deserialize`'s implementation.
  // ```
  // r = pie.route.create('/foo/:id');
  // r.interolations('/foo/bar');
  // //=> {id: 'bar'}
  // ```
  interpolations: function(path) {
    var interpolations = {};

    if(!this.is('hasInterpolations')) return interpolations;

    var splitPaths = path.split('/'),
    tmpls = this.get('segments'),
    splitPath, tmpl;

    for(var i = 0; i < splitPaths.length; i++){
      tmpl = tmpls[i];
      splitPath = splitPaths[i];
      if(splitPath !== tmpl) {
        if(tmpl.charAt(0) === ':') {
          interpolations[tmpl.substr(1)] = splitPath;
        } else if(tmpl.charAt(0) === '*') {
          interpolations[tmpl.substr(1)] = pie.array.get(splitPaths, i, -1).join('/');
          break;
        }
      }
    }

    return interpolations;
  },

  // **pie.route.isDirectMatch**
  //
  // Is the provided `path` a direct match to our definition?
  isDirectMatch: function(path) {
    return path === this.get('pathTemplate');
  },

  // **pie.route.isMatch**
  //
  // is the provided `path` a match based on our `pathRegex`.
  isMatch: function(path) {
    return this.get('pathRegex').test(path);
  },

  // **pie.route.path**
  //
  // Generate a path based on our template & the provided `data`. If `interpolateOnly` is true,
  // a query string will not be appended, even if there are extra items provided by `data`.
  // ```
  // r = pie.route.create('/foo/:id');
  // r.path({id: 'bar'})
  // //=> '/foo/bar'
  // r.path({id: 'baz', page: 2});
  // //=> '/foo/baz?page=2'
  // ```
  path: function(query) {
    var usedKeys = [], path = this.get('pathTemplate');

    path = path.replace(/([:\*])([a-zA-Z0-9_]+)/g, function routePathGenerator(match, indicator, key){
      usedKeys.push(key);

      if(indicator === '*') return query && pie.object.has(query, key) ? query[key] : '';

      if(!query || query[key] == null ||  !String(query[key]).length) {
        throw new Error("[PIE] missing route interpolation: " + match);
      }
      return query[key];
    });

    var unusedData = usedKeys.length ? pie.object.except(query, usedKeys) : query;

    if(!pie.object.isEmpty(unusedData)) {
      var params = pie.object.serialize(pie.object.compact(unusedData, true));
      if(params.length) path = pie.string.urlConcat(path, params);
    }

    return path;
  }

});
// # Pie Router
//
// An interface for declaring, processing, and determing a collection of routes.
pie.router = pie.model.extend('router', {

  // **pie.router.init**
  //
  // Initialize a new router given an `app` and a set of options.
  // Options:
  // * **root** - the root to be prepended to all constructed routes. Defaults to `'/'`.
  init: function(app, options) {
    this._super({
      root: options && options.root || '/'
    }, pie.object.merge({app: app}, options));

    this.cache = pie.cache.create();
    this.state = this.app.state;

    if(!pie.string.endsWith(this.get('root'), '/')) throw new Error("The root option must end in a /");

    this.compute('rootRegex', 'root');
  },


  // **pie.router.rootRegex**
  //
  // A regex for testing whether a path starts with the declared root
  rootRegex: function() {
    return new RegExp('^' + this.get('root') + '(.+)?');
  },


  stateWillChange: function(path, query) {
    return this.cache.fetch('states::' + path, function() {
      path = this.stripRoot(path);

      var route = this.findRoute(path);
      var changes = { __route: route };

      if(route) {
        var interpolations = route.interpolations(path);
        pie.object.merge(changes, {__interpolations: interpolations}, route.get('config.state'), interpolations);
      }

      return changes;
    }.bind(this));
  },


  // **pie.router.findRoute**
  //
  // Find the most relevant route based on `nameOrPath`.
  // Direct matches match first, then the most relevant pattern match comes next.
  findRoute: function(path) {
    return this.cache.fetch('routes::' + path, function(){
      /* if a direct match is present, we return that */
      return this.findDirectMatch(path) || this.findPatternMatch(path);
    }.bind(this));
  },

  findDirectMatch: function(path) {
    return pie.array.detect(this.children, function(r){ return r.isDirectMatch(path); });
  },

  findPatternMatch: function(path) {
    return pie.array.detect(this.children, function(r){ return r.isMatch(path); });
  },


  // **pie.router.map**
  //
  // Add routes to this router.
  // Routes objects which contain a "name" key will be added as a name lookup.
  // You can pass a set of defaults which will be extended into each route object.
  // ```
  // router.map({
  //
  //   '/foo/:id' : {subView: 'foo',  name: 'foo'},
  //   '/bars'    : {subView: 'bars', name: 'bars'},
  //
  //   'api.whatever' : '/api/whatever.json'
  // }, {
  //   view: 'sublayout'
  // });
  // ```
  map: function(routes, defaults){
    defaults = defaults || {};

    var path, config, route, existing;

    pie.object.forEach(routes, function routerMapper(k,r) {

      if(pie.object.isObject(r)) {
        path = k;
        config = r;
        if(defaults) config = pie.object.merge({}, defaults, config);
      } else {
        path = r;
        config = {name: k};
      }

      existing = this.findDirectMatch(path) || config.name;
      this.removeChild(existing);

      route = pie.route.create(path, config);
      this.registerRoute(route);
    }.bind(this));

    this.sortRoutes();
    this.cache.reset();
  },

  registerRoute: function(route) {
    this.addChild(route.get('name'), route);
  },

  // **pie.router.path**
  //
  // Will return the named path. If there is no path with that name it will return itself.
  // You can optionally pass a data hash and it will build the path with query params or
  // with path interpolation.
  // ```
  // router.path("/foo/bar/:id", {id: '44', q: 'search'})
  // //=> "/foo/bar/44?q=search"
  // ```
  // nameOrPath = 'viewB'
  // nameOrPath = '/examples/navigation/view-b'
  // nameOrPath = '/view-b'
  // nameOrPath = 'view-b'
  path: function(nameOrPath, query) {
    var route, path;

    if(nameOrPath.indexOf('/') === 0) {
      nameOrPath = this.stripRoot(nameOrPath);
      route = this.findRoute(nameOrPath);
    } else {
      route = this.getChild(nameOrPath, false)
    }

    if(!route) {
      route = pie.route.create(nameOrPath);
      this.registerRoute(route);
    // if we had a route, we might have interpolations
    } else {
      var interps = route.interpolations(nameOrPath);
      if(!pie.object.isEmpty(interps)) {
        query = pie.object.merge({}, query, interps);
      }
    }

    path = route.path(query);
    path = this.ensureRoot(path);

    return path;
  },

  // **pie.router.sortRoutes**
  //
  // Sorts the routes to be the most exact to the most generic.
  // * prefers fewer interpolations to more
  // * prefers more segments to less
  // * prefers more characters to less
  sortRoutes: function() {
    var c;

    this.sortChildren(function routerChildSorter(a,b) {
      c = b.get('weight') - a.get('weight');
      c = c || b.get('pathTemplate').length - a.get('pathTemplate').length;
      c = c || a.get('pathTemplate').localeCompare(b.get('pathTemplate'));
      return c;
    });
  },

  hasRoot: function(path) {
    return this.get('rootRegex').test(path);
  },

  stripRoot: function(path) {
    var match = path.match(this.get('rootRegex'));
    if(match) path = '/' + (match[1] || '');
    return path;
  },

  ensureRoot: function(path) {
    if(path.match(this.get('rootRegex'))) return path;

    var root = this.get('root');
    /* if path is representative of root, use our root. */
    if(path === '/' || path === '') return root;
    /* if the path is our root, but missing the trailing slash, use our root. */
    if(path === root.substr(0, root.length-1)) return root;
    return pie.string.normalizeUrl(root + path);
  }

}, pie.mixins.container);
pie.routeHandler = pie.base.extend('routeHandler', {

  init: function(app, options) {
    this.app = app;
    this.options = pie.object.merge({
      viewNamespace: 'lib.views',
      uiTarget: 'body',
      viewKey: 'view',
      viewTransitionClass: pie.simpleViewTransition,
      viewTransitionOptions: {}
    }, options);

    this.state = this.app.state;
    this.emitter  = this.app.emitter;

    this.state.observe(this.onRouteChange.bind(this), '__route');
    this._super();
  },

  currentView: function() {
    return this.app.getChild("currentView");
  },

  canRouteBeHandled: function(route) {
    return this.canHandleRedirect(route) || this.canHandleView(route);
  },

  canHandleRedirect: function(route) {
    return route && route.is('config.redirect');
  },

  canHandleView: function(route) {
    return route && route.is('config.view');
  },

  onRouteChange: function() {
    var route = this.state.get('__route');
    if(this.canHandleRedirect(route)) return this.handleRedirect(route);
    this.handleView(route);
  },

  handleRedirect: function(route) {
    var redirectTo = route.get('config.redirect');
    this.app.go(redirectTo);
  },

  handleView: function(route) {

    if(route) {
      var current = this.currentView();
      // if the view that's in there is already loaded, don't remove / add again.
      if(current && current._pieName === route.get('config.' + this.options.viewKey)) return true;
      if(!route.get('config.' + this.options.viewKey)) return false;
    }

    this.transitionToNewView(route);
    return true;
  },

  // The process for transitioning to a new view.
  // Both the current view and the next view are optional.
  transitionToNewView: function(route) {
    var current = this.currentView(),
        target, viewClass, child, transition;

    target = pie.object.isString(this.options.uiTarget) ? pie.qs(this.options.uiTarget) : this.options.uiTarget;

    // Provide some events that can be observed around the transition process.
    this.emitter.fire('viewChanged:before');
    this.emitter.fireAround('viewChanged:around', function routeHandlerTransition() {

      this.emitter.fire('viewChanged');

      if(route) {
        // Use the view key of the route to find the viewClass.
        // At this point we've already verified the view option exists, so we don't have to check it.
        viewClass = pie.object.getPath(window, this.options.viewNamespace + '.' + route.get('config.' + this.options.viewKey));

        // The instance to be added. If the class is not defined, this could and should blow up.
        child = viewClass.create({ app: this.app });

        // Cache an identifier on the view so we can use the current view if there's sub-navigiation.
        // if the url changes but the view does not
        child._pieName = route.get('config.' + this.options.viewKey);
      }

      // Instantiate a transition object based on the app configuration.
      transition = this.options.viewTransitionClass.create(this.app, pie.object.merge({
        oldChild: current,
        newChild: child,
        childName: "currentView",
        targetEl: target
      }, this.options.viewTransitionOptions));

      // Provide a couple common events out of the app.
      transition.emitter.on('removeOldChild:after', function routeHandlerAfterRemoveOldChildCallback() {
        this.emitter.fire('oldViewRemoved', current);
      }.bind(this));

      transition.emitter.on('transition:after', function routeHandlerAfterTransitionCallback() {
        this.emitter.fire('newViewLoaded', child);
      }.bind(this));

      transition.transition(function routeHandlerAfterTransition(){
        // The instance is now our 'currentView'
        this.emitter.fire('viewChanged:after');
      }.bind(this));

    }.bind(this));
  },
});
// # Pie Templates
// A container for a collection of templates. It knows how to read, compile, and invoke template functions.
// ```
// templates.registerTemplate('plainOld', "Just plain old string content: [%= data.id %]");
// templates.render('plainOld', {id: 'fooBar'});
// //=> "Just plain old string content: fooBar"
// ```
//
// Templates can be declared in two ways:
// 1. **script tag content** - tags matching the `templateSelector` class option can be given an id attribute which maps to the templates name.
// If a template by that name is requested and has not yet been compiled, the tag's content will be parsed and a template function will be generated.
// 2. **script tag data-src** - The same process as `1.` is followed but if a `data-src` attribute is present a `text/html` ajax request will take place to fetch the template content.
// After fetch, the content will be parsed and a template will be generated. This method is inherently async and is only checked if `templates#renderAsync` is used.
pie.templates = pie.model.extend('templates', {

  init: function(app, options) {
    this._super({}, pie.object.merge({
      app: app,
      templateSelector: 'script[type="text/pie-template"]'
    }, options));
  },

  _node: function(name) {
    return pie.qs(this.options.templateSelector + '[id="' + name + '"]');
  },

  ensureTemplate: function(name, cb) {
    var node, content, src;

    if(this.get(name)) {
      cb(name);
      return;
    }

    node = this._node(name);
    content = node && (node.content || node.textContent);
    src = node && node.getAttribute('data-src');

    if (content) {
      this.registerTemplate(name, content);
      cb(name);
      return;
    } else if(src) {
      this.load(name, {url: src}, function ensureTemplateCallback(){
        this.ensureTemplate(name, cb);
      }.bind(this));
    } else {
      throw new Error("[PIE] Template fetch error: " + name);
    }

  },

  // **pie.templates.registerTemplate**
  //
  // Register a template containing the `content` by the `name`.
  // The resulting function will be one produced by `pie.string.template` but will
  // have any registered helpers available via the `pie.helpers` `variableName` option.
  //
  // So the following template would function fine, given the default helper methods as defined by `pie.helpers`
  // ```
  // <h1>[%= h.t("account.hello") %], [%= h.get(data, "firstName") %]</h1>
  // ```
  registerTemplate: function(name, content) {
    var args = pie._debugArgs('Compiling template: %c' + name);
    args.push("color: #aaa;");

    this.app.debug.apply(this.app, args);

    this.set(name, pie.string.template(content, this.app.helpers.provideVariables()));
  },

  // **pie.templates.load**
  //
  // Load a template from an external source, register it, then invoke the callback.
  // ```
  // templates.load('fooBar', {url: '/foo-bar.html'}, function(){
  //   template.render('fooBar', {});
  // });
  // ```
  load: function(name, ajaxOptions, cb) {
    ajaxOptions = pie.object.merge({
      verb: 'get',
      accept: 'text/html'
    }, ajaxOptions);

    var req = this.app.ajax.ajax(ajaxOptions);

    req.dataSuccess(function templateLoadCallback(content) {
      this.registerTemplate(name, content);
    }.bind(this)).error(function tmeplateLoadError(){
      throw new Error("[PIE] Template fetch error: " + name);
    }).complete(function templateLoadComplete() {
      cb();
    });

  },

  // **pie.templates.render**
  //
  // Synchronously render a template named `name` with `data`.
  // This will compile and register a template if it's never been seen before.
  // ```
  // <script id="fooBar" type="text/pie-template">
  //   Hi, [%= data.name %]
  // </script>
  // <script>
  //   templates.render('fooBar', {name: 'Doug'});
  //   //=> "Hi, Doug"
  // </script>
  // ```
  render: function(name, data) {
    if(!this.get(name)) {

      var node = this._node(name);

      if(node) {
        this.registerTemplate(name, node.content || node.textContent);
      } else {
        throw new Error("[PIE] Unknown template error: " + name);
      }
    }

    return this.get(name)(data || {});
  },

  // **pie.templates.renderAsync**
  //
  // Render a template asynchronously. That is, attempt to extract the content from the associated `<script>` but
  // if it declares a `data-src` attribute, fetch the content from there instead. When the template is available
  // and rendered, invoke the callback `cb` with the content.
  // ```
  // <script id="fooBar" type="text/pie-template" data-src="/foo-bar.html"></script>
  // <script>
  //   templates.renderAsync('fooBar', {name: 'Doug'}, function(content){
  //     //=> "Hi, Doug"
  //   });
  // </script>
  // ```
  renderAsync: function(name, data, cb) {
    this.ensureTemplate(name, function renderAsyncCallback() {
      var content = this.render(name, data);
      cb(content);
    }.bind(this));
  }
});
// # Pie Validator
// A collection of validators commonly used in web forms.
// ```
// validator = pie.validator.create();
// validator.email("foo@djalfdsaf");
// //=> false
// validator.email("foo@bar.com");
// //=> true
// validator.email("", {allowBlank: true});
// //=> true
// ```
// Messages can be generated based on a validation type and the set of provided options. The messages are formed
// via the associated app's `i18n` object.
// ```
// validator.errorMessage('length', {gte: 4})
// //=> "must be greater than or equal to 4"
// ```
// Default validation messages are configured in i18n.js.
pie.validator = pie.base.extend('validator', {

  init: function(app, options) {
    this.app = app || pie.appInstance;
    this.i18n = app.i18n;
    this.options = pie.object.deepMerge({
      formats: {
        isoDate: /^\d{4}\-\d{2}\-\d{2}$/,
        isoTime: /^\d{4}\-\d{2}\-\d{2}T\d{2}-\d{2}-\d{3}/,
        epochs: /^\d{10}$/,
        epochms: /^\d{13}$/
      }
    }, options);

    this._super();
  },

  // **pie.validator.errorMessage**
  //
  // Generate a validation message based on the given `validationType` and `validationOptions`.
  // Note there is no value given so the message will always be the full set of expectations, not
  // necessarily the parts that failed.
  // ```
  // validator.errorMessage("length", {gte: 4})
  // //=> "must be greater than or equal to 4"
  // ```
  // If validationOptions contains a `message` key, that will be used to produce the message.
  // The `message` key can be a string, i18n attempt path, or a function.
  // If the validationOPtions contains a `messageKey` key, that will be used as an i18n lookup
  // at `app.validations.${messageKey}`.
  errorMessage: function(validationType, validationOptions) {

    if(validationOptions.message) {
      var msg = validationOptions.message;
      if(pie.object.isFunction(msg)) msg = msg(validationType, validationOptions);
      return this.app.i18n.attempt(msg);
    }

    var key = validationOptions.messageKey || validationType,
        base = this.i18n.t('app.validations.' + key),
        rangeOptions = pie.validator.rangeOptions.create(this.app, validationOptions),
        range = rangeOptions.message();

    if(!range && key === 'length') {
      rangeOptions = pie.validator.rangeOptions.create(this.app, {gt: 0});
      range = rangeOptions.message();
    }

    return (base + ' ' + range).trim();
  },


  // **pie.validator.withStandardChecks**
  //
  // A series of common checks to make based on options passed to validators.
  // It handles `allowBlank`, `if`, and `unless` checks. Assuming all of these conditions
  withStandardChecks: function(value, options, f){
    options = options || {};

    if(options.allowBlank && !this.presence(value)) return true;
    if(options.unless && options.unless.call()) return true;
    if(options['if'] && !options['if'].call()) return true;

    return f.call();
  },

  // **pie.validator.ccNumber**
  //
  // Determine whether the provided value looks like a credit card number.
  // It ensures a number, that it has an appropriate length,
  // and that it passes the luhn check.
  //
  // ```
  // validator.ccNumber("4242 4242 4242 4242")
  // //=> true
  // validator.ccNumber("4242 4242")
  // //=> false
  // validator.ccNumber("4242 4244 4442 4242")
  // //=> false
  // ```
  ccNumber: (function(){
    /* http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript */
    /* for checking credit card validity */
    function luhnCheck(a) {
      var b,c,d,e;
      for(d = +a[b = a.length-1], e=0; b--;)
        c = +a[b], d += ++e % 2 ? 2 * c % 10 + (c > 4) : c;
      return !(d%10);
    };

    return function(value, options){
      return this.withStandardChecks(value, options, function ccNumberValidationCallback(){

        // don't get rid of letters because we don't want a mix of letters and numbers passing through
        var sanitized = String(value).replace(/[^a-zA-Z0-9]/g, '');
        return this.number(sanitized) &&
               this.length(sanitized, {gte: 10, lte: 16}) &&
               luhnCheck(sanitized);
      }.bind(this));
    };
  })(),

  // **pie.validator.ccExpirationMonth**
  //
  // Ensures the provided value is a valid month (1-12).
  ccExpirationMonth: function(value, options) {
    return this.withStandardChecks(value, options, function ccExpirationMonthValidationCallback() {
      return this.integer(value, {gte: 1, lte: 12});
    }.bind(this));
  },


  // **pie.validator.ccExpirationYear**
  //
  // Ensures the provided value is a valid credit card year.
  // It assumes the minimum is this year, and the maximum is 20 years from now.
  ccExpirationYear: function(value, options) {
    return this.withStandardChecks(value, options, function ccExpirationYearValidationCallback() {
      var now = new Date();
      return this.integer(value, {gte: now.getFullYear(), lte: now.getFullYear() + 20});
    }.bind(this));
  },


  // **pie.validator.ccSecurity**
  //
  // Ensures a well-formed cvv value.
  // It must be a number between 3 and 4 characters long.
  ccSecurity: function(value, options) {
    return this.withStandardChecks(value, options, function ccSecurityValidationCallback() {
      return this.number(value) &&
              this.length(value, {gte: 3, lte: 4});
    }.bind(this));
  },


  // **pie.validator.chosen**
  //
  // Ensures the provided value is present. To be used for select boxes,
  // radios, and checkboxes.
  // If the value is an array, it will check to see if there is at least one
  // value in the array.
  // ```
  // validator.chosen("")
  // //=> false
  // validator.chosen("foo")
  // //=> true
  // validator.chosen([])
  // //=> false
  // validator.chosen(["foo"])
  // //=> true
  // validator.chosen([""])
  // //=> false
  // ```
  chosen: (function(){

    function valueCheck(value){
      return value != null && value !== '';
    };

    return function chosen(value, options){
      return this.withStandardChecks(value, options, function chosenValidationCallback(){
        if(Array.isArray(value)) {
          return !!value.filter(valueCheck).length;
        }
        return valueCheck(value);
      });
    };
  })(),


  // **pie.validator.date**
  //
  // Determines if the provided value is a date (in the form of an iso8601 timestamp or iso8601 date - "yyyy-mm-dd").
  // Optionally, you may pass any range options for comparison.
  // ```
  // validator.date("2015-04-01")
  // //=> true
  // validator.date("2012-00-00")
  // //=> false
  // validator.date("2015-13-01")
  // //=> false
  // d.setDate("2022-10-10", {gte: new Date()});
  // //=> true
  // ```
  date: function(value, options) {
    options = options || {};
    return this.withStandardChecks(value, options, function dateValidationCallback() {
      var split = value.split('-'), y = split[0], m = split[1], d = split[2], iso, date;

      if(!y || !m || !d) return false;
      if(!this.length(y, {eq: 4}) || !this.length(m, {eq: 2}) || !this.length(d, {eq: 2})) return false;
      if(!this.number(y) || !this.number(m, {gte: 1, lte: 12}) || !this.number(d, {gte: 1, lte: 31})) return false;

      date = new Date(y, m-1, d);

      /* ensure the date is actually in the defined month */
      if(date.getDate() !== parseInt(d, 10)) return false;

      if(!options.sanitized) {
        Object.keys(options).forEach(function dateValidatorSanitizer(k){
          iso = options[k];
          iso = this.app.i18n.l(iso, 'isoDate');
          options[k] = iso;
        });
        options.sanitized = true;
      }

      var ro = pie.validator.rangeOptions.create(this.app, options);
      return ro.matches(value);

    }.bind(this));
  },


  // **pie.validator.email**
  //
  // Loosely checks the validity of an email address.
  // It simply looks for something in the form of [a]@[b].[c]
  // ```
  // validator.email("foo@bar.com")
  // //=> true
  // validator.email("foo@bar")
  // //=> false
  // validator.email("foo@bar.baz.com")
  // //=> true
  // ```
  email: function(value, options) {
    options = pie.object.merge({allowBlank: false}, options || {});
    return this.withStandardChecks(value, options, function emailValidationCallback() {
      return (/^.+@.+\..+$/).test(value);
    });
  },

  // **pie.validator.fn**
  //
  // A generic function interface. This enables a function to be passed,
  // along with all the normal options. The function must respond in true, false,
  // or a promise.
  // ```
  // var opts = {fn: function(v){ return v.length === 3; }};
  // validator.fn("foo", opts);
  // //=> true
  // validator.fn("foos", opts);
  // //=> false
  // ```
  fn: function(value, options) {
    return this.withStandardChecks(value, options, function fnValidationCallback(){
      return options.fn.call(null, value, options);
    });
  },


  // **pie.validator.format**
  //
  // Determine if a value matches a given format. The format, provided via the `format` option, can be a regular expression
  // or a named format as defined by the validator instance's `formats` option.
  // By default, named formats include `isoDate`, `isoTime`, `epochs` (epoch seconds), and `epochms` (epoch milliseconds).
  // ```
  // validator.format("foo", {format: /oo/});
  // //=> true
  // validator.format("bar", {format: /oo/});
  // //=> false
  // validator.format("2015-04-20", {format: 'isoDate'});
  // //=> true
  // validator.format("2015-04-20", {format: 'isoTime'});
  // //=> false
  // ```
  format: function(value, options) {
    options = options || {};
    return this.withStandardChecks(value, options, function formatValidationCallback() {
      var fmt = options.format || options['with'];
      fmt = this.options.formats[fmt] || fmt;
      return !!fmt.test(String(value));
    }.bind(this));
  },


  // **pie.validator.inclusion**
  //
  // Is the value part of the expected list?
  // The list is defined via the `in` option and can either be an array, object, or function.
  // In the case of a function, it is evaluated and the result is used as the list.
  // In the case of an array, the array is checked for `value`'s inclusion.
  // In the case of an object, the `value` is checked for equality.
  // ```
  // validator.inclusion("foo", {in: "foo"});
  // //=> true
  // validator.inclusion("foo", {in: "food"});
  // //=> false
  // validator.inclusion("foo", {in: ["foo"]});
  // //=> true
  // validator.inclusion("foo", {in: []});
  // //=> true, because the "in" option is considered blank.
  // validator.inclusion("foo", {in: function(){ return ["bar"] }});
  // //=> false
  // validator.inclusion("foo", {in: function(){ return ["bar", "foo"] }});
  // //=> true
  // ```
  inclusion: function(value, options) {
    options = options || {};
    return this.withStandardChecks(value, options, function inclusionValidationCallback() {
      var inVal = pie.fn.valueFrom(options['in']);
      if(Array.isArray(inVal)) return !inVal.length || !!~inVal.indexOf(value);
      return inVal == null || inVal === value;
    });
  },

  // **pie.validator.integer**
  //
  // Check if a value is an integer, not based on precision but based on value.
  // ```
  // validator.integer(4)
  // //=> true
  // validator.integer(4.4)
  // //=> false
  // validator.integer(4.0)
  // //=> true
  // validator.integer("4.0")
  // //=> true
  // validator.integer(3, {gt: 1, lte: 10})
  // //=> true
  // validator.integer(3.5, {gt: 1, lte: 10})
  // //=> false
  // ```
  integer: function(value, options){
    return  this.withStandardChecks(value, options, function integerValidationCallback(){
      return  this.number(value, options) &&
              parseInt(value, 10) === parseFloat(value, 10);
    }.bind(this));
  },


  // **pie.validator.length**
  //
  // Is the length of `value` within the desired range?
  // If the value is an array it will use the array's length, otherwise, it will use the length of the String cast version of the value.
  // If no ranges are given, it checks for a length of greater than 0
  // ```
  // validator.length("foo")
  // //=> true
  // validator.length("")
  // //=> false
  // validator.length("foo", {gte: 2, lte: 3})
  // //=> true
  // validator.length(["foo"], {gte: 2, lte: 3})
  // //=> false
  // validator.length([""])
  // //=> true
  // ```
  length: function(value, options){
    options = pie.object.merge({allowBlank: false}, options);

    /* preparation to use the number validator */
    if(!pie.object.hasAny(options, 'gt', 'gte', 'lt', 'lte', 'eq')){
      options.gt = 0;
    }

    return this.withStandardChecks(value, options, function lengthValidationCallback(){
      var length = Array.isArray(value) ? value.length : String(value).trim().length;
      return this.number(length, options);
    }.bind(this));
  },


  // **pie.validator.number**
  //
  // Must be a number and in the given range.
  // ```
  // validator.number(4)
  // //=> true
  // validator.number(4.4)
  // //=> false
  // validator.number("alpha")
  // //=> false
  // validator.number("4.0")
  // //=> true
  // validator.number(3, {gt: 1, lte: 10})
  // //=> true
  // validator.number(20, {gt: 1, lte: 10})
  // //=> false
  // ```
  number: function(value, options){
    options = options || {};

    return this.withStandardChecks(value, options, function numberValidationCallback(){

      value = String(value).trim();
      /* not using parseFloat because it accepts multiple decimals */
      /* ip addresses would be considered numbers if parseFloat was used */
      if(!/^([\-])?([\d]+)?\.?[\d]+$/.test(value)) return false;

      var number = parseFloat(value),
      ro = pie.validator.rangeOptions.create(this.app, options);

      return ro.matches(number);
    });
  },

  // **pie.validator.phone**
  //
  // Remove whitespace and unecessary characters and ensure we have a 10 digit number.
  // clean out all things that are not numbers and + and get a minimum of 10 digits.
  // If you want a locale based phone validation, use the format validator.
  // ```
  // validator.phone("555-555-5555")
  // //=> true
  // validator.phone("555-5555")
  // //=> false
  // validator.phone("(555) 555-5555")
  // //=> true
  // validator.phone("+15555555555")
  // //=> true
  // validator.phone("555-555-5555 on weekdays")
  // //=> true
  // ```
  phone: function(value, options) {
    options = pie.object.merge({allowBlank: false}, options || {});

    return this.withStandardChecks(value, options, function phoneValidationCallback(){
      var clean = String(value).replace(/[^\+\d]+/g, '');
      return this.length(clean, {gte: 10});
    }.bind(this));
  },


  // **pie.validator.presence**
  //
  // Check if a value is truthy and has any non-whitespace characters.
  // ```
  // validator.presence(null)
  // //=> false
  // validator.presence("")
  // //=> false
  // validator.presence("   ")
  // //=> false
  // validator.presence(false)
  // //=> false
  // validator.presence(true)
  // //=> true
  // validator.presence("foo")
  // //=> true
  // ```
  presence: function(value, options){
    return this.withStandardChecks(value, pie.object.merge({}, options, {allowBlank: false}), function(){
      return !!(value && (/[^ ]/).test(String(value)));
    });
  },

  // **pie.validator.uniqueness**
  //
  // Determine whether the given value is unique within the array defined by the `within` option.
  // The `within` option can be an array or a function which returns an array.
  // ```
  // validator.uniqueness("foo", {within: ["foo", "bar"]})
  // //=> true
  // validator.uniqueness("foo", {within: ["foo", "bar", "foo"]})
  // //=> false
  // validator.uniqueness("foo", {within: function(){ return ["foo", "bar"]; }});
  // //=> true
  // ```
  uniqueness: function(value, options) {
    return this.withStandardChecks(value, options, function uniquenessValidationCallback() {

      if(!options.within) return true;
      var within = pie.fn.valueFrom(options.within), i = 0, cnt = 0;
      for(; i < within.length; i++) {
        if(within[i] === value) cnt++;
        if(cnt > 1) return false;
      }

      return true;
    });
  },

  // **pie.validator.url**
  //
  // Determine whether `value` loosely looks like a url.
  // For a more complicated url check, use the format validator.
  // ```
  // validator.url("http://www.google.com")
  // //=> true
  // validator.url("https://www.google.com")
  // //=> true
  // validator.url("www.google.com")
  // //=> false
  // ```
  url: function(value, options) {
    options = pie.object.merge({}, options, {format: /^https?\:\/\/.+\..+$/});
    return this.format(value, options);
  }

});



// ## Pie Range Options
//
// A small utilitly class which matches range options to comparators.
// ```
// range = pie.validator.rangeOptions.create(app, {gte: 3, lt: 8});
// range.matches(3)
// //=> true
// range.matches(10)
// //=> false
// ```
pie.validator.rangeOptions = pie.base.extend('rangeOptions', {

  init: function(app, hash) {
    this.i18n = app.i18n;
    this.rangedata = hash || {};
    /* for double casting situations */
    if(pie.object.has(this.rangedata, 'rangedata')) this.rangedata = this.rangedata.rangedata;

    this._super();
  },

  get: function(key) {
    return pie.fn.valueFrom(this.rangedata[key]);
  },

  has: function(key) {
    return pie.object.has(this.rangedata, key);
  },

  t: function(key, options) {
    return this.i18n.t('app.validations.range_messages.' + key, options);
  },

  matches: function(value) {
    var valid = true;
    valid = valid && (!this.has('gt') || value > this.get('gt'));
    valid = valid && (!this.has('lt') || value < this.get('lt'));
    valid = valid && (!this.has('gte') || value >= this.get('gte'));
    valid = valid && (!this.has('lte') || value <= this.get('lte'));
    valid = valid && (!this.has('eq') || value === this.get('eq'));
    return valid;
  },

  message: function() {
    if(this.has('eq')) {
      return this.t('eq', {count: this.get('eq')});
    } else {
      var s = ['',''];

      if(this.has('gt')) s[0] += this.t('gt', {count: this.get('gt')});
      else if(this.has('gte')) s[0] += this.t('gte', {count: this.get('gte')});

      if(this.has('lt')) s[1] += this.t('lt', {count: this.get('lt')});
      else if(this.has('lte')) s[1] += this.t('lte', {count: this.get('lte')});

      return pie.array.toSentence(pie.array.compact(s, true), this.i18n).trim();
    }
  }
});
// general framework for transitioning between views.
pie.abstractViewTransition = pie.base.extend('abstractViewTransition', {

  init: function(parent, options) {
    options = options || {};

    this.emitter    = pie.emitter.create();
    this.parent     = parent;
    this.oldChild   = options.oldChild;
    this.newChild   = options.newChild;
    this.childName  = options.childName || this.oldChild && this.oldChild._nameWithinParent;
    this.targetEl   = options.targetEl  || this.oldChild && this.oldChild.el.parentNode;

    if(!this.childName) throw new Error("No child name provided for view transition");
    if(!this.targetEl)  throw new Error("No target element provided for view transition");

    this.options = options;

    this.emitter.on('transition:before', this.manageChildren.bind(this));
    this.propagateTransitionEvents();

    this._super();
  },

  // fire a sequence which looks like
  // ```
  // | transition:before
  // | transition
  // |--| removeOldChild:before
  // |  | removeOldChild
  // |  | removeOldChild:after
  // |  |--| addNewChild:before
  // |     | addNewChild
  // |     | addNewChild:after
  // | transition:after
  // ```
  transition: function(cb) {
    var em = this.emitter;

    em.on('addNewChild:after', function() {
      em.fire('transition:after');
      if(cb) cb();
    });

    em.on('removeOldChild:after', function() {
      em.fire('addNewChild:before');
      em.fireAround('addNewChild:around', function() {
        em.fire('addNewChild');
      });
    });

    em.on('transition', function() {
      em.fire('removeOldChild:before');
      em.fireAround('removeOldChild:around', function() {
        em.fire('removeOldChild');
      });
    });

    em.fire('transition:before');
    em.fireAround('transition:around', function() {
      em.fire('transition');
    });
  },

  // to be called at the beginning of each transition.
  // this removes the old child from it's parent and adds the new one
  // it also begins the setup process for the new child.
  manageChildren: function() {
    if(this.oldChild) this.parent.removeChild(this.oldChild);
    if(this.newChild) {
      this.parent.addChild(this.childName, this.newChild);
      if(!this.newChild.emitter.hasEvent('setup:before')) this.newChild.setup();
    }
  },

  propagateTransitionEvents: function() {
    var em = this.emitter,
    oldEm = this.oldChild && this.oldChild.emitter,
    newEm = this.newChild && this.newChild.emitter;

    if(oldEm) {
      em.on('removeOldChild:before', function() {
        oldEm.fire('transitionOut:before');
      });

      em.on('removeOldChild:after', function() {
        oldEm.fire('transitionOut:after');
      });
    }

    if(newEm) {
      em.on('addNewChild:before', function() {
        newEm.fire('transitionIn:before');
      });

      em.on('transition:after', function() {
        newEm.fire('transitionIn:after');
      });
    }
  }

});


// Simple view transition: remove the old child from the view and dom, add the new child immediately after.
// Uses the default sequence of events.
pie.simpleViewTransition = pie.abstractViewTransition.extend('simpleViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.emitter.on('removeOldChild', this.removeOldChild.bind(this));
    this.emitter.on('addNewChild',    this.addNewChild.bind(this));
  },

  setLoading: function(bool) {
    if(!this.options.loadingClass) return;
    this.targetEl.classList[bool ? 'add' : 'remove'](this.options.loadingClass);
  },

  addNewChild: function() {
    if(!this.newChild) {
      this.emitter.fire('addNewChild:after');
      return;
    }

    this.begin = pie.date.now();

    this.setLoading(true);

    if(this.options.minDelay) {
      setTimeout(this.attemptToAddChild.bind(this), this.options.minDelay);
    }

    this.newChild.emitter.once('setup:after', this.attemptToAddChild.bind(this), {immediate: true});
  },

  attemptToAddChild: function() {
    var now = pie.date.now();

    /* ensure our child has been setup */
    if(!this.newChild.emitter.hasEvent('setup:after')) return;

    /* ensure the minimum delay has been reached */
    if(this.options.minDelay && now < (this.begin + this.options.minDelay)) return;

    this.setLoading(false);

    /* ensure our view was not removed from our parent */
    if(this.newChild.parent !== this.parent) return;

    this.newChild.addToDom(this.targetEl);
    this.emitter.fire('addNewChild:after');
  },

  removeOldChild: function() {
    if(this.oldChild) this.oldChild.teardown();
    this.emitter.fire('removeOldChild:after');
  }

});

pie.loadingViewTransition = pie.simpleViewTransition.extend('loadingViewTransition', {
  init: function() {
    this._super.apply(this, arguments);
    this.options.loadingClass = this.options.loadingClass || 'is-loading';
  }
});

// A transition which applies an "out" class to the old view, removes it after it transitions out, then adds
// the new view to the dom and applies an "in" class.
// Preparation of the new view is done as soon as the transition is started, enabling the shortest possible
// amount of delay before the next view is added to the dom.
pie.inOutViewTransition = pie.abstractViewTransition.extend('inOutViewTransition', {

  init: function() {
    this._super.apply(this, arguments);

    this.options = pie.object.merge({
      // the new view will gain this class
      inClass: 'view-in',
      // the old view will gain this class
      outClass: 'view-out',
      // if the browser doesn't support onTransitionEnd, here's the backup transition duration
      backupDuration: 250,
      // async=true means the new view doesn't wait for the old one to leave.
      // async=false means the new view won't be added to the dom until the previous is removed.
      async: false
    }, this.options);

    this.setupObservations();
  },

  setupObservations: function() {
    var em = this.emitter;

    if(this.oldChild) {
      em.on('transitionOldChild',       this.cancelWrap('transitionOldChild'));
      em.on('transitionOldChild:after',  this.cancelWrap('teardownOldChild'));
    } else {
      em.on('transitionOldChild', function() {
        em.fire('transitionOldChild:after');
      });
    }

    if(this.newChild) {
      em.on('addNewChild',              this.cancelWrap('addNewChild'));
      em.on('transitionNewChild:around', this.cancelWrap('ensureNewChildPrepared'));
      em.on('transitionNewChild',       this.cancelWrap('refresh'));
      em.on('transitionNewChild',       this.cancelWrap('transitionNewChild'));

      this.newChild.emitter.once('removedFromParent', this.cancel.bind(this));
    } else {
      em.on('transitionNewChild', function() {
        em.fire('transitionNewChild:after');
      });
    }
  },

  cancelWrap: function(fnName) {
    return function(){
      if(!this.emitter.hasEvent('cancel')) {
        this[fnName].apply(this, arguments);
      }
    }.bind(this);
  },

  // apply the relevant class(es) to the element.
  applyClass: function(el, isIn) {
    var add = isIn ? this.options.inClass : this.options.outClass,
        remove = isIn ? this.options.outClass : this.options.inClass;

    if(add) pie.dom.addClass(el, add);
    if(remove) pie.dom.removeClass(el, remove);
  },

  // WHEN options.async !== true
  // fire a sequence which looks like
  // ```
  // | transition:before
  // | transition
  // |  |--| removeOldChild:before
  // |     |--| transitionOldChild:before
  // |        | transitionOldChild
  // |        |--| transitionOldChild:after
  // |           |--| removeOldChild
  // |           |  |--| removeOldChild:after
  // |           |
  // |           |--| addNewChild:before
  // |              | addNewChild
  // |              |--| addNewChild:after
  // |                 |--| transitionNewChild:before
  // |                    | transitionNewChild
  // |                    |--| transitionNewChild:after
  // |                       |--| transition:after
  // ```
  //
  // WHEN options.async === true
  // fire a sequence which looks like
  // ```
  // | transition:before
  // | transition
  // |  |--| removeOldChild:before
  // |  |  |--| transitionOldChild:before
  // |  |     | transitionOldChild
  // |  |     |--| transitionOldChild:after
  // |  |        |--| removeOldChild
  // |  |           |--| removeOldChild:after
  // |  |
  // |  |--| addNewChild:before
  // |     | addNewChild
  // |     |--| addNewChild:after
  // |        |--| transitionNewChild:before
  // |           | transitionNewChild
  // |           |--| transitionNewChild:after
  // |              |--| transition:after
  // ```

  transition: function(cb) {
    var em = this.emitter;

    em.on('transitionNewChild:after', function() {
      em.fire('transition:after');
      if(cb) cb();
    });

    if(this.options.async) {
      em.on('transition', function() {
        em.fireSequence('addNewChild');
      });
    } else {
      em.on('removeOldChild:after', function() {
        em.fireSequence('addNewChild');
      });
    }

    em.on('addNewChild:after', function() {
      em.fire('transitionNewChild:before');
      em.fireAround('transitionNewChild:around', function() {
        em.fire('transitionNewChild');
      });
    });

    em.on('transitionOldChild:after', function() {
      em.fireSequence('removeOldChild');
    });

    em.on('transition', function() {
      em.fire('transitionOldChild:before');
      em.fireAround('transitionOldChild:around', function() {
        em.fire('transitionOldChild');
      });
    });

    em.fire('transition:before');
    em.fireAround('transition:around', function() {
      em.fire('transition');
    });

  },

  cancel: function() {
    if(!this.emitter.hasEvent('transitionNewChild:after')) {

      // the goal of a transition is to get the old child out and the new child in,
      // we make sure we've done that.
      if(this.oldChild) {
        this.teardownOldChild();
      }

      if(this.newChild) {
        this.applyClass(this.newChild.el, true);
        this.newChild.addToDom(this.targetEl);
      }

      // then we let everyone else know.
      this.emitter.fire('cancel');
    }
  },

  // teardown() the child if it hasn't already.
  teardownOldChild: function() {
    if(!this.oldChild.emitter.hasEvent('teardown:before')) {
      this.oldChild.teardown();
    }
  },

  // Add the new child to the dom.
  addNewChild: function() {
    this.newChild.addToDom(this.targetEl);
  },

  ensureNewChildPrepared: function(cb) {
    this.newChild.emitter.once('render:after', cb, {immediate: true});
  },

  // make sure we're rendered, then begin the ui transition in.
  // when complete, invoke the callback.
  transitionNewChild: function() {
    this.observeTransitionEnd(this.newChild.el, true, 'transitionNewChild:after');
  },

  // start the transition out. when complete, invoke the callback.
  transitionOldChild: function() {
    if(!this.oldChild.el.parentNode) this.emitter.fire('transitionOldChild:after');
    else this.observeTransitionEnd(this.oldChild.el, false, 'transitionOldChild:after');
  },

  // ensure the browser has redrawn and locations are up to date.
  refresh: function(cb) {
    if(this.oldChild) this.oldChild.el.getBoundingClientRect();
    if(this.newChild) this.newChild.el.getBoundingClientRect();
    if(cb) cb();
  },

  // build a transition callback, and apply the appropriate class.
  // when the transition is complete, invoke the callback.
  observeTransitionEnd: function(el, isIn, fire) {
    var transitionEvent = this.transitionEvent(el),
    trans = transitionEvent.event,
    dur = transitionEvent.duration,
    called = false,
    onTransitionEnd = function() {
      if(called) return;
      called = true;
      if(trans) pie.dom.off(el, trans, onTransitionEnd);
      this.emitter.fire(fire);
    }.bind(this);

    this.emitter.once('cancel', onTransitionEnd);

    if(trans) {
      pie.dom.on(el, trans, onTransitionEnd);
    }

    this.applyClass(el, isIn);

    if(trans) {
      if(!isNaN(dur)) {
        setTimeout(onTransitionEnd, dur * 1.1);
      }
    } else {
      setTimeout(onTransitionEnd, this.options.backupDuration);
    }
  },

  // which transition event should we use?
  transitionEndEvent: function(base){
    var cap = pie.string.capitalize(base);

    if(this._transitionEndEvent === undefined) {
      if(pie.object.has(window, 'on' + base + 'end', true)) {
        this._transitionEndEvent = base + 'end';
      } else if(pie.object.has(window, 'onwebkit' + base + 'end', true)) {
        this._transitionEndEvent = 'webkit' + cap + 'End';
      } else if(pie.object.has(window, 'ms' + cap + 'End', true)) {
        this._transitionEndEvent = 'ms' + cap + 'End';
      } else if(pie.object.has(document.body, 'ono' + base + 'end', true) || navigator.appName === 'Opera') {
        this._transitionEndEvent = 'o' + cap + 'End';
      } else {
        this._transitionEndEvent = false;
      }
    }

    return this._transitionEndEvent;
  },

  // get a transition or animation property based on the browser's compatability.
  subProperty: function(endEvent, prop) {
    return endEvent.replace(/end/i, pie.string.capitalize(prop));
  },

  transitionEvent: function(el) {
    var endA = this.transitionEndEvent('transition'),
        endB = this.transitionEndEvent('animation'),
        objA = this._transitionEvent(endA, el),
        objB = this._transitionEvent(endB, el);


    return objA.duration > objB.duration ? objA : objB;
  },

  _transitionEvent: function(endEvent, el) {
    if(!endEvent) {
      return {
        duration: 0
      };
    }

    var durProp = this.subProperty(endEvent, 'duration'),
        delayProp = this.subProperty(endEvent, 'delay'),
        style = window.getComputedStyle(el),
        durs = durProp && style[durProp] && style[durProp].split(',') || ['0'],
        delays = delayProp && style[delayProp] && style[delayProp].split(',') || ['0'],
        dur, delay;

    durs = durs.map(function(d){ return parseFloat(d.toLowerCase(), 10); });
    delays = delays.map(function(d){ return parseFloat(d.toLowerCase(), 10); });

    dur = Math.max.apply(null, durs);
    delay = Math.max.apply(null, delays);

    if(durProp && durProp.indexOf('ms') < 0) {
      dur *= 1000;
    }

    if(delayProp && delayProp.indexOf('ms') < 0) {
      delay *= 1000;
    }

    return {
      event: endEvent,
      duration: parseInt(dur + delay, 10)
    };
  }

});
pie.binding = pie.base.extend('binding', {

  init: function(view, model, options) {
    this.view = view;
    this.model = model;
    this.options = options;
    this.emitterUids = [];

    this.normalizeOptions();
    this.setupViewCallbacks();
    this.setupModelCallbacks();
  },

  teardown: function() {
    var v = this.view;
    this.emitterUids.forEach(v.eoff.bind(v));

    if(this.modelObserverUid) {
      v.unobserve(this.modelObserverUid);
    }
  },

  normalizeOptions: function() {
    if(!this.options.attr) throw new Error("An attr must be provided for data binding. " + JSON.stringify(this.options));

    var given       = this.options || {};
    var out         = {};
    /* the model attribute to be observed / updated. */
    out.attr        = given.attr;
    /* the selector to observe */
    out.sel         = given.sel         || '[name="' + given.attr + '"]';
    /* the way in which the binding should extract the value from the dom. */
    out.type        = given.type        || 'auto';
    /* the desired type the dom value's should be cast to. */
    out.dataType    = given.dataType    || 'default';
    /* if `dataType` is "array", they type which should be applied to each. */
    out.eachType    = given.eachType    || undefined;
    /* when an input changes or has a keyup event, the model will update. */
    out.trigger     = given.trigger     || 'change keyup';
    /* just in case the dom events should be based on a different field than that provided by `sel` */
    out.triggerSel  = given.triggerSel  || out.sel;
    /* if toModel is not provided, it's presumed to be desired. */
    out.toModel     = given.toModel     || (given.toModel === undefined && out.type !== 'class');
    /* if toView is not provided, it's presumed to be desired. */
    out.toView      = given.toView      || given.toView === undefined;
    /* no debounce by default. */
    out.debounce    = given.debounce    || false;
    /* secondary options. */
    out.options     = given.options     || {};

    /* A `true` value will results in a default debounce duration of 250ms. */
    if(out.debounce === true) out.debounce = 250;

    this.options = out;
  },

  getModelValue: function() {
    var val = this.model.get(this.options.attr);
    if(this.options.decorator) val = this.options.decorator(val);
    return val;
  },

  // The type caster based on the `dataType`.
  getTypeCaster: function(dataType) {
    dataType = dataType || this.options.dataType;
    return pie.binding.typeCasters[dataType] || pie.binding.typeCasters['default'];
  },

  // Provide a way to retrieve values out of the dom & apply values to the dom.
  getIntegration: function(el) {
    if(this.options.type === 'auto') return this.determineIntegrationForElement(el);
    return pie.binding.integrations[this.options.type] || pie.binding.integrations.value;
  },

  // If type=auto, this does it's best to determine the appropriate integration.
  determineIntegrationForElement: function(el) {
    var mod;
    if(el.hasAttribute && el.hasAttribute('data-' + this.options.attr)) mod = 'attribute';
    else if(el.nodeName === 'INPUT' && String(el.getAttribute('type')).toUpperCase() === 'CHECKBOX') mod = 'check';
    else if(el.nodeName === 'INPUT' && String(el.getAttribute('type')).toUpperCase() === 'RADIO') mod = 'radio';
    else if(el.nodeName === 'INPUT' || el.nodeName === 'SELECT' || el.nodeName === 'TEXTAREA') mod = 'value';
    else mod = 'text';

    return pie.binding.integrations[mod];
  },

  // Wiring of the view-to-model callbacks. These will observe dom events
  // and translate them to model values.
  setupViewCallbacks: function() {
    var _toModel = this.options.toModel;
    var opts = this.options;

    if(!_toModel) return;


    // If a function is provided, use that as the base implementation.
    if(!pie.object.isFunction(_toModel)) {
      // Otherwise, we provide a default implementation.
      _toModel = function(el, opts, binding) {
        var value = binding.getValueFromElement(el);
        binding.applyValueToModel(value, opts);
      };
    }

    var toModel = function(e) {
      var el = e.delegateTarget;
      _toModel(el, opts, this);
    }.bind(this);


    // If a debounce is requested, we apply the debounce to the wrapped function,
    // Leaving the base function untouched.
    if(opts.debounce) toModel = pie.fn.debounce(toModel, opts.debounce);

    this.toModel = _toModel;

    // Multiple events could be supplied, separated by a space.
    opts.trigger.split(' ').forEach(function(event){
      // Use the view's event management to register the callback.
      this.emitterUids.push(this.view.on(event, opts.triggerSel, toModel));
    }.bind(this));
  },

  setupModelCallbacks: function() {
    var toView = this.options.toView;
    var opts = this.options;

    if(!toView) return;

    if(!pie.object.isFunction(toView)) {
      toView = function(changeSet) {
        this.lastChange = changeSet && changeSet.get(opts.attr);
        this.applyValueToElements();
      }.bind(this);
    }

    this.toView = toView;
    this.modelObserverUid = this.view.observe(this.model, toView, opts.attr);
  },

  applyValueToElements: function() {
    if(this.ignore) return;

    var els = this.els();
    for(var i = 0; i < els.length; i++) {
      this.getIntegration(els[i]).setValue(els[i], this);
    }
  },

  // Extract a value out of an element based on a binding configuration.
  getValueFromElement: function(el) {
    // Get the basic value out of the element.
    var val = this.getIntegration(el).getValue(el, this),
    // Get the type casting function it based on the configuration.
    fn = this.getTypeCaster();
    // Type cast the value.
    val = fn(val);

    // If we're configured to have an array and have defined an `eachType`
    // use it to typecast each value.
    if(this.options.dataType === 'array' && this.options.eachType) {
      var eachFn = this.getTypeCaster(this.options.eachType);
      val = val.map(eachFn);
    }

    return val;
  },


  // Apply a value to the model, ensuring the model-to-view triggers do not take place.
  applyValueToModel: function(value, opts) {
    var setValues = {};
    setValues[this.options.attr] = value;
    this.applyValuesToModel(setValues, opts);
  },

  applyValuesToModel: function(values, opts) {
    try{
      this.ignore = true;
      this.model.sets(values, opts);

    // Even if we error, we should reset the ignore.
    } finally {
      this.ignore = false;
    }
  },

  readFields: function(opts) {
    if(!this.toModel) return;

    var els = this.els();

    for(var i = 0; i < els.length; i++) {
      this.toModel(els[i], opts, this);
    }
  },

  els: function() {
    return pie.object.isString(this.options.sel) ? this.view.qsa(this.options.sel) : pie.array.from(this.options.sel);
  }

});


// A set of methods to cast raw values into a specific type.
pie.binding.typeCasters = {
  array: function(raw) {
    return pie.array.from(raw);
  },

  boolean: (function(){

    // Match different strings representing truthy values.
    var reg = /^(1|true|yes|ok|on)$/;

    return function(raw) {
      if(raw == null) return raw;
      return !!(raw && reg.test(String(raw)));
    };

  })(),

  // Attempt to parse as a float, if `NaN` return `null`.
  number: function(raw) {
    var val = parseFloat(raw, 10);
    if(isNaN(val)) return null;
    return val;
  },

  // Attempt to parse as an integer, if `NaN` return `null`.
  integer: function(raw) {
    var val = parseInt(raw, 10);
    if(isNaN(val)) return null;
    return val;
  },

  // `null` or `undefined` are passed through, otherwise cast as a String.
  string: function(raw) {
    return raw == null ? raw : String(raw);
  },

  "default" : function(raw) {
    return raw;
  }

};

// Bind to an element's attribute.
pie.ns('pie.binding.integrations').attribute = (function(){

  // extract the attribute name from the binding configuration.
  var attributeName = function(binding){
    return binding.options.options.attribute || ('data-' + binding.options.attr);
  };

  return {

    getValue: function(el, binding) {
      return el.getAttribute(attributeName(binding));
    },

    setValue: function(el, binding) {
      var value = binding.getModelValue();
      return el.setAttribute(attributeName(binding), value);
    }

  };
})();

pie.binding.integrations['class'] = {
  getValue: function(/* el, binding */) {
    throw new Error("class bindings can only be from the model to the view. Please declare toModel: false");
  },

  setValue: function(el, binding) {
    var className = binding.options.options.className;

    if(className === '_value_') {
      var change = binding.lastChange;
      if(change) {
        if(change.oldValue) {
          pie.dom.removeClass(el, change.oldValue);
        }

        if(change.value) {
          pie.dom.addClass(el, change.value);
          return change.value;
        }
      }
    } else {
      var value = binding.getModelValue();
      className = className || binding.options.attr;

      pie.dom[!!value ? 'addClass' : 'removeClass'](el, className);

      return className;
    }
  }
};

pie.binding.integrations.value = {

  // Simple value extraction
  getValue: function(el /*, binding */) {
    return el.value;
  },

  // Apply the model's value to the element's value.
  setValue: function(el, binding) {
    var value = binding.getModelValue();
    /* jslint eqnull:true */
    if(value == null) value = '';
    return el.value = value;
  }

};

pie.binding.integrations.check = (function(){

  // String based index.
  var index = function(arr, value) {
    if(!arr) return -1;
    value = String(value);
    return pie.array.indexOf(arr, function(e){ return String(e) === value; });
  };

  return {

    getValue: function(el, binding) {

      // If we have an array, manage the values.
      if(binding.options.dataType === 'array') {

        var existing = pie.array.from(binding.getModelValue()), i;

        i = index(existing, el.value);

        // If we are checked and we don't already have it, add it.
        if(el.checked && i < 0) {
          existing = pie.array.dup(existing);
          existing.push(el.value);
        // If we are not checked but we do have it, then we add it.
        } else if(!el.checked && i >= 0) {
          existing = pie.array.dup(existing);
          existing.splice(i, 1);
        }

        return existing;
      } else if(binding.options.dataType === 'boolean'){
        return !!el.checked;
      } else {
        // Otherwise, we return the el's value if it's checked.
        return el.checked ? el.value : null;
      }
    },

    // If the model's value contains the checkbox, check it.
    setValue: function(el, binding) {
      var value = binding.getModelValue(),
      elValue = el.value;

      // In the case of an array, we check for inclusion.
      if(binding.options.dataType === 'array') {
        var i = index(value, elValue);
        return el.checked = !!~i;
      } else {
        var caster = binding.getTypeCaster(binding.options.dataType);

        // Otherwise we check for equality
        return el.checked = caster(elValue) === caster(value);
      }
    }
  };

})();


pie.binding.integrations.radio = {

  // If a radio input is checked, return it's value.
  // Otherwise, return the existing value.
  getValue: function(el, binding) {
    var existing = binding.getModelValue();
    if(el.checked) return el.value;
    return existing;
  },

  // Check a radio button if the value matches.
  setValue: function(el, binding) {
    var value = binding.getModelValue(),
    elValue = el.value,
    caster = binding.getTypeCaster();

    /* jslint eqeq:true */
    return el.checked = caster(elValue) === caster(value);
  }

};

// Set the innerTEXT of an element based on the model's value.
pie.binding.integrations.text = {

  getValue: function(el /*, binding */) {
    return el.textContent;
  },

  setValue: function(el, binding) {
    var value = binding.getModelValue();

    /* jslint eqnull:true */
    if(value == null) value = '';
    return el.textContent = value;
  }

};

// Set the innerHTML of an element based on the model's value.
pie.binding.integrations.html = {

  getValue: function(el /*, binding */) {
    return el.innerHTML;
  },

  setValue: function(el, binding) {
    var value = binding.getModelValue();
    /* jslint eqnull:true */
    if(value == null) value = '';
    return el.innerHTML = value;
  }

};

pie.binding.integrations.fn = {
  getValue: function(el) {
    throw new Error("fn integrations do not provide a dom-to-model integration. Please use the `toModel: false` option.");
  },

  setValue: function(el, binding) {
    var value = binding.getModelValue();
    return binding.options.options.fn(el, value, binding);
  }
}
  pie.VERSION = "0.1.20150831.1";
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function () {
      return pie;
    });
  } else {
    window.pie = pie;
  }
})(this);

// don't do any animations in tests.
pie.object.reopen(pie.fn, {
  ease: function(each, o, complete) {
    if (window.app.config.is("animationsDisabled")) {
      o = o || {};
      o.name = "none";
    }

    return this._super(each, o, complete);
  },
});
/*
 * File: /apps/web/app/assets/javascripts/web/vendor/floor.js
 * Project: tr-web
 * Created Date: 2020-06-23
 * Author: Raif
 *
 * Copyright (c) 2020 TaskRabbit, Inc
 */
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */

var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308,
    NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin = Math.min;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Creates a function like `_.round`.
 *
 * @private
 * @param {string} methodName The name of the `Math` method to use when rounding.
 * @returns {Function} Returns the new round function.
 */
function createRound(methodName) {
  var func = Math[methodName];
  return function(number, precision) {
    number = toNumber(number);
    precision = nativeMin(toInteger(precision), 292);
    if (precision) {
      // Shift with exponential notation to avoid floating-point issues.
      // See [MDN](https://mdn.io/round#Examples) for more details.
      var pair = (toString(number) + 'e').split('e'),
          value = func(pair[0] + 'e' + (+pair[1] + precision));

      pair = (toString(value) + 'e').split('e');
      return +(pair[0] + 'e' + (+pair[1] - precision));
    }
    return func(number);
  };
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Computes `number` rounded down to `precision`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Math
 * @param {number} number The number to round down.
 * @param {number} [precision=0] The precision to round down to.
 * @returns {number} Returns the rounded down number.
 * @example
 *
 * _.floor(4.006);
 * // => 4
 *
 * _.floor(0.046, 2);
 * // => 0.04
 *
 * _.floor(4060, -2);
 * // => 4000
 */
var floor = createRound('floor');

pie.ns("lib.mixins").floor = floor;
pie.ns("lib.mixins").validationView = {
  setupInlineValidations: function(model) {
    model = model || this.model;
    this.observe(model, "inlineValidationObserver", "validationErrors.*");
  },

  inlineValidationObserver: function(changes) {
    var k, v, el, sel, msg;

    changes.forEach(
      function(change) {
        if (change.name.indexOf("validationErrors.") < 0) return;

        k = change.name.replace("validationErrors.", "");
        v = change.value;

        sel =
          '.js-error-target[data-key="' +
          k +
          '"], .js-error-target[data-key^="' +
          k +
          ' "], .js-error-target[data-key*=" ' +
          k +
          ' "], .js-error-target[data-key$=" ' +
          k +
          '"]';

        // first element that contains the key
        el = this.qs(sel);
        el = el || (pie.dom.matches(this.el, sel) && this.el);

        if (el) {
          msg =
            (v &&
              v.length &&
              pie.string.capitalize(
                pie.array.toSentence(v, { punctuate: "." })
              )) ||
            undefined;
          el.classList[msg ? "add" : "remove"]("error-container");
          el[msg ? "setAttribute" : "removeAttribute"](
            "data-validation-message",
            msg
          );
        }

        this.emitter.fire("validationTargetsPlaced");
      }.bind(this)
    );
  },
};
pie.ns("lib.mixins").popoutView = {
  setup: function() {
    this.options.template = this.options.template || this.DEFAULT_TEMPLATE_NAME;

    this.emitter.on("render:before", this.registerTemplate.bind(this));
    this.emitter.on("render:after", this.addToDom.bind(this));

    this._super();
  },

  addToDom: function() {
    if (this.el.parentNode) return;
    this._super(document.body);
  },

  registerTemplate: function() {
    var n = this.DEFAULT_TEMPLATE_NAME;
    if (this.options.template !== n) return;

    if (!this.app.templates.has(n)) {
      this.app.templates.registerTemplate(n, this.DEFAULT_TEMPLATE);
    }
  },
};
pie.ns("lib.mixins").referrals = {
  getReferralData: function() {
    return app.pageContext.get("referral");
  },

  currentUser: function() {
    return (
      (window.page && window.page.models && window.page.models.currentUser) ||
      (window.app && window.app.currentUser)
    );
  },

  getReferralsMetricsAttributes: function(additionalMetricsData) {
    var metricsData = { poster_id: this.currentUser().get("id") };
    return pie.object.merge({}, metricsData, additionalMetricsData);
  },

  getModalData: function(additionalMetricsData) {
    return pie.object.merge(
      {},
      { referral_data: this.getReferralData() },
      {
        metrics_attributes: this.getReferralsMetricsAttributes(
          additionalMetricsData
        ),
      }
    );
  },

  referralRedirect: function(additionalData, e) {
    if (additionalData & additionalData.source) {
      window.location = app.internalPath("/dashboard/referral?source=" + additionalData.source);
      return;
    }

    window.location = app.internalPath("/dashboard/referral");
  },

  fireReferralEvent: function(client_publish_type, eventData) {
    var metricsAttributes = this.getReferralsMetricsAttributes(eventData);
    this.app.metrics.fire(client_publish_type, metricsAttributes);
  },
};
pie.ns("lib").notifier = pie.notifier.extend({
  storageKey: "tr-v3-notifications",

  init: function() {
    this._super.apply(this, arguments);

    this.app.state.observe(this.onStateChange.bind(this), "__id");
  },

  notifyNext: function(message) {
    message = this.app.i18n.attempt(message);
    var msgs = this.app.storage.get(this.storageKey) || [];
    msgs.push(message);
    this.app.storage.set(this.storageKey, msgs);
  },

  onStateChange: function() {
    var route = this.app.state.get("__route");

    if (this.app.routeHandler.canHandleView(route)) {
      var msgs = this.app.storage.get(this.storageKey);
      if (msgs && msgs.length) this.notify(msgs);
    }
  },
});
window.google_conversion_function = function (pageCb) {
    var g = this;
    var h = parseFloat("0.06"),
        k = isNaN(h) || 1 < h || 0 > h ? 0 : h;
    var l = function (a, c) {
        for (var d in a) Object.prototype.hasOwnProperty.call(a, d) && c.call(null, a[d], d, a)
    };
    var m, n, p, q, r = function () {
            return g.navigator ? g.navigator.userAgent : null
        };
    q = p = n = m = !1;
    var s;
    if (s = r()) {
        var t = g.navigator;
        m = 0 == s.lastIndexOf("Opera", 0);
        n = !m && (-1 != s.indexOf("MSIE") || -1 != s.indexOf("Trident"));
        p = !m && -1 != s.indexOf("WebKit");
        q = !m && !p && !n && "Gecko" == t.product
    }
    var u = n,
        v = q,
        w = p;
    var x;
    if (m && g.opera) {
        var y = g.opera.version;
        "function" == typeof y && y()
    } else v ? x = /rv\:([^\);]+)(\)|;)/ : u ? x = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/ : w && (x = /WebKit\/(\S+)/), x && x.exec(r());
    var z = function (a) {
        this.b = [];
        this.a = {};
        for (var c = 0, d = arguments.length; c < d; ++c) this.a[arguments[c]] = ""
    }, C = function () {
            var a = A,
                c = "317150500 317150501 317150502 317150503 317150504 317150505".split(" ");
            if (a.a.hasOwnProperty(1) && "" == a.a[1]) {
                r: {
                    if (!(1E-4 > Math.random())) {
                        var d = Math.random();
                        if (d < k) {
                            try {
                                var b = new Uint16Array(1);
                                window.crypto.getRandomValues(b);
                                d = b[0] / 65536
                            } catch (e) {
                                d = Math.random()
                            }
                            c = c[Math.floor(d * c.length)];
                            break r
                        }
                    }
                    c = null
                }
                c && "" != c && a.a.hasOwnProperty(1) && (a.a[1] = c)
            }
        };
    z.prototype.c = function (a) {
        return this.a.hasOwnProperty(a) ? this.a[a] : ""
    };
    z.prototype.geil = z.prototype.c;
    var D = function () {
        var a = A,
            c = [];
        l(a.a, function (a) {
            "" != a && c.push(a)
        });
        return 0 < a.b.length && 0 < c.length ? a.b.join(",") + "," + c.join(",") : a.b.join(",") + c.join(",")
    };
    var A, E = "google_conversion_id google_conversion_format google_conversion_type google_conversion_order_id google_conversion_language google_conversion_value google_conversion_currency_code google_conversion_domain google_conversion_label google_conversion_color google_disable_viewthrough google_remarketing_only google_remarketing_for_search google_conversion_items google_custom_params google_conversion_date google_conversion_time google_conversion_js_version onload_callback opt_image_generator google_is_call google_conversion_page_url".split(" ");

    function F(a) {
        return null != a ? escape(a.toString()) : ""
    }

    function G(a) {
        return null != a ? a.toString().substring(0, 512) : ""
    }

    function H(a, c) {
        var d = F(c);
        if ("" != d) {
            var b = F(a);
            if ("" != b) return "&".concat(b, "=", d)
        }
        return ""
    }

    function I(a) {
        var c = typeof a;
        return null == a || "object" == c || "function" == c ? null : String(a).replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/=/g, "\\=")
    }

    function J(a) {
        var c;
        if ((a = a.google_custom_params) && "object" == typeof a && "function" != typeof a.join) {
            var d = [];
            for (c in a)
                if (Object.prototype.hasOwnProperty.call(a, c)) {
                    var b = a[c];
                    if (b && "function" == typeof b.join) {
                        for (var e = [], f = 0; f < b.length; ++f) {
                            var B = I(b[f]);
                            null != B && e.push(B)
                        }
                        b = 0 == e.length ? null : e.join(",")
                    } else b = I(b);
                    (e = I(c)) && null != b && d.push(e + "=" + b)
                }
            c = d.join(";")
        } else c = "";
        return "" == c ? "" : "&".concat("data=", encodeURIComponent(c))
    }

    function K(a) {
        return "number" != typeof a && "string" != typeof a ? "" : F(a.toString())
    }

    function L(a) {
        if (!a) return "";
        a = a.google_conversion_items;
        if (!a) return "";
        for (var c = [], d = 0, b = a.length; d < b; d++) {
            var e = a[d],
                f = [];
            e && (f.push(K(e.value)), f.push(K(e.quantity)), f.push(K(e.item_id)), f.push(K(e.adwords_grouping)), f.push(K(e.sku)), c.push("(" + f.join("*") + ")"))
        }
        return 0 < c.length ? "&item=" + c.join("") : ""
    }

    function M(a, c, d) {
        var b = [];
        if (a) {
            var e = a.screen;
            e && (b.push(H("u_h", e.height)), b.push(H("u_w", e.width)), b.push(H("u_ah", e.availHeight)), b.push(H("u_aw", e.availWidth)), b.push(H("u_cd", e.colorDepth)));
            a.history && b.push(H("u_his", a.history.length))
        }
        d && "function" == typeof d.getTimezoneOffset && b.push(H("u_tz", -d.getTimezoneOffset()));
        c && ("function" == typeof c.javaEnabled && b.push(H("u_java", c.javaEnabled())), c.plugins && b.push(H("u_nplug", c.plugins.length)), c.mimeTypes && b.push(H("u_nmime", c.mimeTypes.length)));
        return b.join("")
    }

    function N(a, c, d) {
        var b = "";
        if (c) {
            var e;
            if (a.top == a) e = 0;
            else {
                var f = a.location.ancestorOrigins;
                if (f) e = f[f.length - 1] == a.location.origin ? 1 : 2;
                else {
                    f = a.top;
                    try {
                        e = !! f.location.href || "" === f.location.href
                    } catch (B) {
                        e = !1
                    }
                    e = e ? 1 : 2
                }
            }
            f = "";
            f = d ? d : 1 == e ? a.top.location.href : a.location.href;
            b += H("frm", e);
            b += H("url", G(f));
            b += H("ref", G(c.referrer))
        }
        return b
    }

    function O(a) {
        return a && a.location && a.location.protocol && "https:" == a.location.protocol.toString().toLowerCase() ? "https:" : "http:"
    }

    function P(a) {
        return a.google_remarketing_only ? "googleads.g.doubleclick.net" : a.google_conversion_domain || "www.googleadservices.com"
    }

    function Q(a, c, d, b) {
        var e = "/?";
        "landing" == b.google_conversion_type && (e = "/extclk?");
        var e = O(a) + "//" + P(b) + "/pagead/" + [b.google_remarketing_only ? "viewthroughconversion/" : "conversion/", F(b.google_conversion_id), e, "random=", F(b.google_conversion_time)].join(""),
            f;
        r: {
            f = b.google_conversion_language;
            if (null != f) {
                f = f.toString();
                if (2 == f.length) {
                    f = H("hl", f);
                    break r
                }
                if (5 == f.length) {
                    f = H("hl", f.substring(0, 2)) + H("gl", f.substring(3, 5));
                    break r
                }
            }
            f = ""
        }
        a = [H("cv", b.google_conversion_js_version), H("fst", b.google_conversion_first_time),
            H("num", b.google_conversion_snippets), H("fmt", b.google_conversion_format), H("value", b.google_conversion_value), H("currency_code", b.google_conversion_currency_code), H("label", b.google_conversion_label), H("oid", b.google_conversion_order_id), H("bg", b.google_conversion_color), f, H("guid", "ON"), H("disvt", b.google_disable_viewthrough), H("is_call", b.google_is_call), H("eid", D()), L(b), M(a, c, b.google_conversion_date), J(b), N(a, d, b.google_conversion_page_url), b.google_remarketing_for_search && !b.google_conversion_domain ?
            "&srr=n" : ""
        ].join("");
        return e + a
    }

    function R() {
        var a = S,
            c = document,
            d = T,
            b;
        b = O(a) + "//www.google.com/ads/user-lists/" + [F(d.google_conversion_id), "/?random=", Math.floor(1E9 * Math.random())].join("");
        return b += [H("label", d.google_conversion_label), H("fmt", "3"), N(a, c, d.google_conversion_page_url)].join("")
    }

    function U(a) {
        return {
            ar: 1,
            bg: 1,
            cs: 1,
            da: 1,
            de: 1,
            el: 1,
            en_AU: 1,
            en_US: 1,
            en_GB: 1,
            es: 1,
            et: 1,
            fi: 1,
            fr: 1,
            hi: 1,
            hr: 1,
            hu: 1,
            id: 1,
            is: 1,
            it: 1,
            iw: 1,
            ja: 1,
            ko: 1,
            lt: 1,
            nl: 1,
            no: 1,
            pl: 1,
            pt_BR: 1,
            pt_PT: 1,
            ro: 1,
            ru: 1,
            sk: 1,
            sl: 1,
            sr: 1,
            sv: 1,
            th: 1,
            tl: 1,
            tr: 1,
            vi: 1,
            zh_CN: 1,
            zh_TW: 1
        }[a] ? a + ".html" : "en_US.html"
    }

    function V() {
        var a = S,
            c = navigator,
            d = document,
            b = S;
        3 != b.google_conversion_format || b.google_remarketing_only || b.google_conversion_domain || A && C();
        var e = A ? A.c(1) : "",
            c = Q(a, c, d, b),
            d = function (a, b, c) {
                return '<img height="' + c + '" width="' + b + '" style="display:none;" border="0" alt="" src="' + a + '" />'
            };
        return 0 == b.google_conversion_format && null == b.google_conversion_domain ? '<a href="' + (O(a) + "//services.google.com/sitestats/" + U(b.google_conversion_language) + "?cid=" + F(b.google_conversion_id)) + '" target="_blank">' + d(c, 135, 27) + "</a>" : 1 < b.google_conversion_snippets ||
            3 == b.google_conversion_format ? "317150501" == e || "317150502" == e || "317150503" == e || "317150504" == e || "317150505" == e ? d(c, 1, 1) + ('<script src="' + c.replace(/(&|\?)fmt=3(&|$)/, "$1fmt=4&adtest=on$2") + '">\x3c/script>') : d(c, 1, 1) : '<iframe name="google_conversion_frame" title="Google conversion frame" width="' + (2 == b.google_conversion_format ? 200 : 300) + '" height="' + (2 == b.google_conversion_format ? 26 : 13) + '" src="' + c + '" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no">' +
            d(c.replace(/\?random=/, "?frame=0&random="), 1, 1) + "</iframe>"
    }

    function aa() {
        return new Image
    }

    function ba() {
        var a = T,
            c = R(),
            d = aa;
        "function" === typeof a.opt_image_generator && (d = a.opt_image_generator);
        a = d();
        c += H("async", "1");
        a.src = c;
        a.onload = function () {
            if(pageCb) pageCb();
        }
    };
    var S = window;
    if (S)
        if (null != /[\?&;]google_debug/.exec(document.URL)) {
            var ca = S,
                W = document.getElementsByTagName("head")[0];
            W || (W = document.createElement("head"), document.getElementsByTagName("html")[0].insertBefore(W, document.getElementsByTagName("body")[0]));
            var X = document.createElement("script");
            X.src = O(window) + "//" + P(ca) + "/pagead/conversion_debug_overlay.js";
            W.appendChild(X)
        } else {
            try {
                var Y;
                var Z = S;
                var _el_ = document.createElement('div');
                "landing" == Z.google_conversion_type || !Z.google_conversion_id || Z.google_remarketing_only && Z.google_disable_viewthrough ? Y = !1 : (Z.google_conversion_date = new Date, Z.google_conversion_time = Z.google_conversion_date.getTime(), Z.google_conversion_snippets = "number" == typeof Z.google_conversion_snippets && 0 < Z.google_conversion_snippets ? Z.google_conversion_snippets + 1 : 1, "number" != typeof Z.google_conversion_first_time && (Z.google_conversion_first_time = Z.google_conversion_time), Z.google_conversion_js_version = "7", 0 != Z.google_conversion_format && 1 != Z.google_conversion_format && 2 != Z.google_conversion_format && 3 != Z.google_conversion_format &&
                    (Z.google_conversion_format = 1), A = new z(1), Y = !0);
                _el_.innerHTML = V();
                // don't see how this will ever be truthy. that looks to be fine in our case
                if (Y && (document.querySelector('body').appendChild(_el_), S.google_remarketing_for_search && !S.google_conversion_domain)) {
                    var T = S;
                    ba()
                }
            } catch (da) {}
            for (var ea = S, $ = 0; $ < E.length; $++) ea[E[$]] = null
        };
};
/* globals sessionStorageGet */

pie.ns("lib.metrics").subscription = pie.model.extend("subscription", {
  init: function(app, source, config) {
    this._super(
      {},
      {
        app: app,
      }
    );

    this.set("source", source);
    this.set("config", config);
  },

  defaultEventData: function() {
    var u = this.app.currentUser;

    return pie.object.merge(
      {
        guid: u.guid(),
        user_id: u.get("id"),
        metric_client: "web",
        locale: this.app.config.get("locale"),

        protocol: document.location.protocol,
        hostname: document.location.hostname,
        pathname: document.location.pathname,
        query: document.location.search,
        target_url: document.location.href,

        marketing_referrer: this.app.marketingReferrer(),
        referrer: document.referrer,

        logged_in: this.app.currentUser.isLoggedIn(),
        poster_status: this.app.currentUser.get("poster_status"),
        first_time_user: this.app.currentUser.isFirstTimeUser(),

        epoch_ms: Date.now(),
        session_id: sessionStorageGet("tr_sess_id"),
      },
      this.get("config.defaults")
    );
  },

  log: function(event, eventData) {
    if (!this.app.config.is("debugEnabled")) return;
    var args = this._debugArgs(
      'sending "%c' +
        event +
        '%c" to %c' +
        this.get("source") +
        "%c with data:\n%c" +
        JSON.stringify(eventData, undefined, 2)
    );
    args.push("font-weight: bold;");
    args.push("");
    args.push("font-weight: bold;");
    args.push("");
    args.push("color: #aaa;");
    this.app.debug.apply(this.app, args);
  },

  publish: function(event, eventData) {
    try {
      eventData = this.sanitizeEventData(eventData);

      this.log(event, eventData);

      if (!this.shouldPublish()) {
        return pie.promise.resolve(true);
      }

      return this._publish(event, eventData);
    } catch (e) {
      this.app.errorHandler.reportError(e, {
        handledBy: "lib.metrics.subscription#publish",
      });

      return pie.promise.resolve(e);
    }
  },

  shouldPublish: function() {
    return this.app.config.get("metricsEnabled");
  },

  _publish: function(/* event, data, cb */) {
    var args = this._debugArgs(
      "no subscription class implemented for source: %c" + this.get("source")
    );
    args.push("color: #ccc;");
    this.app.debug.apply(this.app, args);
  },

  sanitizeEventData: function(d) {
    var attrs = this.get("config.attrs");
    if (attrs !== "*") d = pie.object.slice(d, attrs);
    d = pie.object.merge(this.defaultEventData(), d);
    return pie.object.flatten(d);
  },

  _debugArgs: function(msg) {
    return [
      "%c[metrics] %c" + msg,
      "color: #098D46; font-weight: bold;",
      "color: inherit",
    ];
  },
});
/* globals UET */

pie.ns("lib.metrics").bingSubscription = lib.metrics.subscription.extend(
  "bingSubscription",
  {
    eventMappings: {
      user_created: {
        "en-US": "4028411",
        "en-GB": "4028412",
        // HOSER: put real one
        "en-CA": "4028412",
      },
      job_posted: {
        "en-US": "4028442",
        "en-GB": "4028444",
        // HOSER: put real one
        "en-CA": "4028444",
      },
    },

    _publish: function(event, data) {
      var triggerId = pie.object.getPath(
        this,
        "eventMappings." + event + "." + app.config.get("locale")
      );
      if (!triggerId) return pie.promise.resolve();

      this.ensureBingLoaded().then(
        function() {
          return this._trigger(triggerId, data);
        }.bind(this)
      );
    },

    ensureBingLoaded: function() {
      return this.app.resources.load("//bat.bing.com/bat.js");
    },

    _trigger: function(triggerId, data, cb) {
      return pie.promise.create(function(resolve, reject) {
        var o = {
          ti: triggerId,
          q: [],
        };

        var uet = new UET(o);
        uet.push("pageLoad");

        setTimeout(resolve, 100);
      });
    },
  }
);
pie.ns("lib.metrics").bridge = pie.model.extend("bridge", {
  fireAll: function (events, meta) {
    var promises = events.map(
      function (event) {
        return this.fire(event, meta);
      }.bind(this)
    );
    return pie.promise.all(promises);
  },

  fire: function (event, meta) {
    // grab the subscriptions for the specific event type.
    var subs = pie.array.from(this.get("subscriptions." + event)),
      // provide a callback function for the pie.fn.async interface.
      promises = subs.map(function (sub) {
        return sub.publish(sub.get("config.eventName"), meta);
      });

    // start sending to all our integrations.
    var resultPromise = pie.promise.all(promises);

    // here's our backup. We wait no more than 5 second for the promise to resolve.
    // a promise will only resolve and flush once, so we don't have to worry about
    // multiple invocations.
    setTimeout(resultPromise.resolve.bind(resultPromise), 5000);

    return resultPromise;
  },

  subscribe: function (/* subscriptionConfigs */) {
    for (var i = 0; i < arguments.length; i++) {
      this._subscribe(arguments[i]);
    }
  },

  _normalizeSubscription: function (sub) {
    if (!sub.key) throw new Error("Key is a required subscription field.");

    sub.eventName = sub.eventName || sub.key;
    sub.sources = pie.array.from(sub.source || sub.sources);
    sub.attrs = sub.attr || sub.attrs || "*";

    if (!sub.sources.length)
      throw new Error("Source is a required subscription field.");
  },

  _subscribe: function (subscription) {
    this._normalizeSubscription(subscription);

    var arr = this.getOrSet("subscriptions." + subscription.key, []),
      desiredClass = subscription.subscriptionClass,
      klass,
      sub;

    subscription.sources.forEach(
      function (source) {
        sub = pie.object.merge({}, subscription, { source: source });
        delete sub.sources;

        klass =
          desiredClass ||
          lib.metrics[source + "Subscription"] ||
          lib.metrics.subscription;
        sub = klass.create(this.app, source, sub);
        arr.push(sub);
      }.bind(this)
    );
  },
});
pie.ns("lib.metrics").busSubscription = lib.metrics.subscription.extend(
  "busSubscription",
  {
    // for bus events, we always publish
    shouldPublish: function() {
      return true;
    },

    _publish: function(event, data) {
      data = pie.object.merge(
        { client_publish_type: event, locale: this.app.config.get("locale") },
        data
      );
      return this.app.ajax
        .post({
          url: "/api/v3/polltime/publish.json",
          data: data,
        })
        .promise();
    },
  }
);
pie.ns("lib.metrics").gaSubscription = lib.metrics.subscription.extend(
  "gaSubscription",
  {
    _publish: function(event, data) {
      if (!window.ga) {
        return pie.promise.resolve();
      }

      return pie.promise.create(function(resolve, reject) {
        data = pie.object.merge({ hitType: event, hitCallback: resolve }, data);
        window.ga("send", data);
      });
    },
  }
);
pie.ns("lib.metrics").gtmSubscription = lib.metrics.subscription.extend(
  "gtmSubscription",
  {
    _publish: function(event, data) {
      if (!window.gtmInterface) {
        if (window.Bugsnag && event === "userCreated") {
          window.Bugsnag.notifyException(
            new Error("GTM Error: Google Tag Manager not loaded")
          );
        }
        return pie.promise.resolve();
      }

      return pie.promise.create(function(resolve, reject) {
        window.gtmInterface(event, data, resolve);
      });
    },
  }
);
pie.ns("lib").app = pie.app.extend(
  "app",
  (function() {
    var envSettings = {
      defaults: {
        metricsEnabled: false,
        debugEnabled: true,
        allowShortcuts: true,
        animationsDisabled: false,
      },
      test: {
        animationsDisabled: true,
      },
      staging: {
        metricsEnabled: true,
      },
      production: {
        metricsEnabled: true,
        debugEnabled: false,
        allowShortcuts: false,
      },
    };

    var localeSettings = {
      defaults: {
        vehicleOptions: [
          "bicycle",
          "car",
          "moving_truck",
          "suv",
          "truck",
          "van",
        ],
      },
      "en-GB": {
        vehicleOptions: [
          "bicycle",
          "car",
          "motorcycle",
          "moving_truck",
          "suv",
          "van",
        ],
      },
    };

    return {
      init: function(options) {
        this._super(
          pie.object.deepMerge(
            {
              errorHandler: lib.errorHandler,
              notifier: lib.notifier,
              storageOptions: {
                primary: "localStorage",
                backup: "backup",
              },
              routeHandlerOptions: {
                uiTarget: ".main--content",
              },
              i18nOptions: {
                settings: {
                  nestedStart: "%{lookup.",
                },
              },
            },
            options
          )
        );

        this.config.dynamic("env", envSettings);
        this.config.dynamic("locale", localeSettings);

        this.metrics = lib.metrics.bridge.create();

        this.currentUser = lib.models.currentUser.create();
        this.pageContext = lib.models.pageContext.create(this.currentUser);
        this.currentUser.observe(
          this.pageContext.onCurrentUserChange.bind(this.pageContext),
          "__version"
        );
        this.state.observe(this.onUrlChange.bind(this), "__id");

        this.addChild("page", lib.layout.page.create(this));

        this.emitter.on(
          "start:before",
          this.currentUser.touch.bind(this.currentUser)
        );
        this.emitter.on("start:before", this.bootstrap.bind(this));
        this.emitter.on("urlChanged", this.trackPageView.bind(this));
        this.emitter.on("viewChanged", this.onViewChange.bind(this));

        this.pageContext.observe(this.addPromotionBanner, "currentPromo");
        this.pageContext.observe(this.addSeasonalBanner, "currentPromo");
      },

      addPromotionBanner: function() {
        var klass = pie.object.getPath(window, "lib.components.countdown");
        if (!klass) return;

        var cnt = new klass({});
        cnt.start();
      },

      addSeasonalBanner: function() {
        var klass = pie.object.getPath(window, "lib.components.seasonalBanner");
        if (!klass) return;

        var seasonalBanner = new klass({});

        seasonalBanner.render();
      },

      fetchBootstrapData: function() {
        return pie.promise.create(function(resolve, reject) {
          var metroOverride = app.state.get("_metro_id");
          var data = {};

          if (metroOverride) data = { metro_id: metroOverride };

          app.ajax.get({
            url: "/api/v3/web-client/bootstrap.json",
            data: data,
            dataSuccess: function(d) {
              if (d) {
                resolve(d);
              } else {
                reject();
              }
            },
          });
        });
      },

      shouldFetchBootstrap: function() {
        // Only set in apps/web/app/views/web/v3_react/build_index.haml
        return !this.pageContext.get("disableBootstrap");
      },

      bootstrap: function() {
        if (this.shouldFetchBootstrap()) {
          this.fetchBootstrapData().then(
            function(d) {
              this.pageContext.set(
                "currentPromo",
                pie.promise.resolve(d.promotion)
              );
              this.pageContext.sets(d);
            }.bind(this)
          );
        }
      },

      debug: function() {
        if (!this.config.get("debugEnabled")) return;
        this._super.apply(this, arguments);
      },

      confirm: function(options, lightboxOptions) {
        if (pie.object.isString(options)) options = { text: options };
        if (pie.object.isString(lightboxOptions)) {
          lightboxOptions = { title: lightboxOptions };
        }

        var confirm = lib.components.confirm.create(options);
        var lightbox = lib.components.lightbox.create(confirm, lightboxOptions);
        this.addChild("confirm" + pie.uid(lightbox), lightbox);

        return confirm.promise;
      },

      onUrlChange: function() {
        var route = this.state.get("__route");
        // trigger if we are handling the pushState
        if (
          this.options.staticApp ||
          this.routeHandler.canRouteBeHandled(route)
        ) {
          this.emitter.fire("urlChanged");
        }
      },

      onViewChange: function() {
        this.pageContext.reset();

        // get us back to the top of the page.
        // todo: make part of the transition configuration?
        this.scrollTo(null);
      },

      // just a proxy for now, consider grabbing the appropriate scroll parent here.
      scrollTo: function(sel, options) {
        pie.dom.scrollTo(sel, options);
      },

      trackPageView: function() {
        var firstTime = this.emitter.firedCount("urlChanged") === 1;

        if (firstTime && this.currentUser.guid()) {
          var q = this.state.get("__query");
          var hasUtmParam = !!(
            q.utm_source ||
            q.utm_medium ||
            q.utm_term ||
            q.utm_content ||
            q.utm_campaign ||
            q.ref ||
            q.gclid
          );
          var referrerHostname = document.referrer.split("?")[0];
          var isExternal =
            referrerHostname.length > 0 &&
            !referrerHostname.match(/taskrabbit\./);

          if (hasUtmParam || isExternal) {
            this.metrics.fire("page_referred", q);

            var filterFactor = 100;
            var randomInt = Math.floor(Math.random() * filterFactor);

            if (
              window.Bugsnag &&
              window.Bugsnag.notifyException &&
              randomInt === 0 // Only report 1% of these exceptions to reduce volume.
            ) {
              window.Bugsnag.notifyException(new Error("Pie Metrics Use"), {
                event: "page_referred",
                arguments: q,
              });
            }
          }
        }

        // We only want to do this on url changes 2+ since google analytics will handle the original load.
        if (!firstTime) {
          this.metrics.fire("pageview", { page: this.state.get("__id") });
        }
      },

      marketingReferrer: function() {
        var q = this.state.get("__query");
        q = pie.object.slice(
          q,
          "utm_campaign",
          "utm_source",
          "utm_medium",
          "utm_term",
          "utm_content",
          "ref",
          "gclid"
        );
        return pie.object.serialize(q);
      },

      renderNotFound: function() {
        var path = app.path(app.internalPath("/not-found"));
        this.go(path, true);
      },

      realtime: function() {
        if (this._realtimeBridge) return this._realtimeBridge;
        this._realtimeBridge = lib.models.realtime.bridge.create();
        return this._realtimeBridge;
      },

      internalPath: function(path, internalPathContext) {
        internalPathContext =
          internalPathContext || window.INTERNAL_PATH_CONTEXT;
        var trCountry = internalPathContext.trCountry;
        var trLanguage = internalPathContext.trLanguage;

        if (
          !(trCountry && trLanguage) ||
          path[0] !== "/" ||
          new RegExp("^/" + trCountry + "/" + trLanguage + "/").test(path)
        ) {
          return path;
        }

        return "/" + trCountry + "/" + trLanguage + path;
      },
    };
  })()
);
lib.staticApp = lib.app.extend({
  init: function(options) {
    options = options || {};
    options.staticApp = true;

    this._super(options);

    this.emitter.on("start", this.setStaticPageContext.bind(this));
  },

  setStaticPageContext: function() {
    this.pageContext.sets({
      "layout.headerVisible":
        this.options.headerVisible === false ? false : true,
      "layout.headerStyle": this.options.headerStyle || "static",
      "layout.bodyStyle": this.options.bodyStyle || undefined,
      "layout.drawerTriggerVisible": true,
      "layout.footerVisible":
        this.options.footerVisible === false ? false : true,
      "layout.pressFooterVisible":
        this.options.pressFooterVisible === false ? false : true,
    });
  },

  onViewChange: pie.fn.noop,
});
pie.ns("lib").view = pie.view.extend("view", {
  init: function() {
    this._super.apply(this, arguments);
    this.el.setAttribute("data-pie-id", pie.uid(this));
  },
});
lib.activeView = pie.activeView.extend("activeView", lib.view);
lib.formView = pie.formView.extend(
  "formView",
  lib.activeView,
  {
    setup: function() {
      var rmLoad = this.removeLoadingState.bind(this),
        addLoad = this.addLoadingState.bind(this);

      if (!this.options.skipLoadingStateOnSubmit) {
        this.emitter.prepend("onInvalid", rmLoad);
        this.emitter.prepend("onFailure", rmLoad);

        this.emitter.prepend("submit", addLoad);
      }

      if (this.options.removeLoadingStateOnSuccess) {
        this.emitter.on("onSuccess", rmLoad);
      }

      if (this.options.inlineValidations) {
        this.emitter.on("setup:before", this.setupInlineValidations.bind(this));
      }

      this._super();
    },

    _setLoadingState: function(bool) {
      var sel = this.options.loadingSel || 'button[type="submit"]',
        cls = this.options.loadingClass || "is-loading";

      pie.dom.all(
        this.qsa(sel),
        bool ? "classList.add" : "classList.remove",
        cls
      );
    },

    addLoadingState: function() {
      this._setLoadingState(true);
    },

    removeLoadingState: function() {
      this._setLoadingState(false);
    },

    validateAndSubmitForm: function() {
      this.app.notifier.clear();
      return this._super.apply(this, arguments);
    },
  },
  lib.mixins.validationView
);
lib.listView = pie.listView.extend("listView", lib.activeView, {});
pie.ns("lib").layoutView = lib.activeView.extend({
  pageContextOptions: undefined,

  setup: function() {
    if (!this.hasLayoutChildCalled) this.hasLayoutChild();
    this.eon("setup", "setupPageContext");

    this._super.apply(this, arguments);
  },

  setupPageContext: function() {
    var opts = pie.fn.valueFrom(this.pageContextOptions, this);
    if (opts) this.app.pageContext.sets(opts);
  },

  hasLayoutChild: function(options, cb) {
    this.hasLayoutChildCalled = true;

    options = pie.object.merge(
      {
        name: "child",
        sel: ".js-child-container",
        viewNs: "lib.views",
        viewTransitionClass: pie.loadingViewTransition,
        factoryArgs: [this.list || this.model],
        scroll: this.parent === this.app,
      },
      options
    );

    if (!options.stateKey && !options.routeKey) options.routeKey = "subView";

    if (!options.blocker && options.routeBlocker) {
      options.blocker = function routeBlocker(cb) {
        var r = this.app.state.get("__route");
        if (!r || !r.tests(options.routeBlocker)) return;
        cb();
      }.bind(this);
    }

    if (!options.blocker && options.stateBlocker) {
      options.blocker = function stateBlocker(cb) {
        if (!this.app.state.tests(options.stateBlocker)) return;
        cb();
      }.bind(this);
    }

    if (!options.filter && options.routeFilter) {
      options.filter = function routeFilter() {
        var r = this.app.state.get("__route");
        return r && r.tests(options.routeFilter);
      }.bind(this);
    }

    if (!options.filter && options.stateFilter) {
      options.filter = function stateFilter() {
        return this.app.state.tests(options.stateFilter);
      }.bind(this);
    }

    if (!options.viewClassNameFactory) {
      options.viewClassNameFactory = function() {
        var route = this.app.state.get("__route");
        var subView =
          route && options.routeKey && route.get("config." + options.routeKey);
        subView =
          subView || (options.stateKey && this.app.state.get(options.stateKey));
        subView =
          subView && pie.array.compact([options.viewNs, subView]).join(".");

        return subView;
      }.bind(this);
    }

    if (!options.factory) {
      options.factory = function(current) {
        var subView = options.viewClassNameFactory();

        if (current && current.__parentLayoutKey === subView) return current;

        var klass = subView && pie.object.getPath(window, subView);

        if (!klass) return;

        var instance = klass.create.apply(klass, options.factoryArgs);
        instance.__parentLayoutKey = subView;

        return instance;
      };
    }

    var manageChild = this.hasChild(options);
    this.observe(this.app.state, manageChild, options.stateKey || "__route");

    if (options.scroll) {
      this.eon(
        options.name + ":manage:after",
        function(info) {
          if (info.instance && info.current !== info.instance)
            this.app.scrollTo();
        }.bind(this)
      );
    }

    return manageChild;
  },
});
// Options can be provided which the lightbox view rendering process will respect:
//   * dismissable - (boolean) whether or not the lightbox should gain an X in the top-right / a background click should dismiss the lightbox
//   * title - (string) the optional title of the lightbox. the title is displayed above the view's content.
// Note that any element with the class of "js-dismiss" will dismiss the lightbox upon click.
//
// Example:
// ```
// var lightbox = lib.components.lightbox.create(someView, { title: 'Hey you!' });
// this.addChild('lightbox', lightbox);
// ```
pie.ns("lib.components").lightbox = lib.activeView.extend(
  "lightbox",
  {
    debugName: "lightbox",

    init: function(child, options) {
      options = pie.object.merge({}, options, {
        el: pie.dom.createElement(
          '<div class="lightbox--container is-hidden"></div>'
        ),
        setup: false,
      });

      this._super(options);

      this.addChild("currentView", child);
    },

    DEFAULT_TEMPLATE_NAME: "lightboxContainer",

    DEFAULT_TEMPLATE: [
      '<div class="lightbox--background js-lightbox-bg"></div>',
      '<div class="lightbox--internal">',
      '  <div class="lightbox--content-wrapper">',
      '    <div class="lightbox--title js-lightbox-title is-hidden"></div>',
      '    <div class="lightbox--content js-lightbox-content">',
      '      <div class="page-loader"></div>',
      "    </div>",
      '    <a href="#" class="lightbox--dismiss js-lightbox-dismiss js-dismiss">',
      '      <i class="ss-lnr-cross2"></i>',
      "    </a>",
      "  </div>",
      "</div>",
    ].join("\n"),

    addedToParent: function() {
      this._super();
      this.setup();
    },

    isInApp: function() {
      return true;
    },

    resetNoScroll: function() {
      document.body.setAttribute("data-no-scroll", this.previousNoScrollValue);
    },

    setup: function() {
      this.on("click", ".js-dismiss", "onDismiss");

      this.eon("render:after", "configureLightbox");
      this.eon("render:after", "setupChildView");
      this.eon("render:after", "show");

      this.eon("teardown", "resetNoScroll");

      this._super();
    },

    configureLightbox: function() {
      var bg = this.qs(".js-lightbox-bg"),
        dismiss = this.qs(".js-lightbox-dismiss"),
        title = this.qs(".js-lightbox-title");

      if (this.options.dismissable === false) {
        if (dismiss) dismiss.classList.add("is-hidden");
        if (bg) bg.classList.remove("js-dismiss");
      } else {
        if (dismiss) dismiss.classList.remove("is-hidden");
        if (bg) bg.classList.add("js-dismiss");
      }

      title.innerHTML = this.options.title
        ? app.i18n.attempt(this.options.title)
        : "";
      title.classList[this.options.title ? "remove" : "add"]("is-hidden");
    },

    hide: function(e) {
      this.emitter.fireSequence(
        "hide",
        function() {
          if (this.parent) this.parent.removeChild(this);
          this.teardown();
        }.bind(this)
      );
    },

    onDismiss: function(e) {
      this.consumeEvent(e);
      this.emitter.fireSequence(
        "dismiss",
        function() {
          this.children.forEach(function(child) {
            child.emitter.fire("dismiss");
          });
          this.hide();
        }.bind(this)
      );
    },

    show: function() {
      this.emitter.fireSequence(
        "show",
        function() {
          this.el.classList.remove("is-hidden");
          this.previousNoScrollValue = document.body.getAttribute(
            "data-no-scroll"
          );
          document.body.setAttribute("data-no-scroll", "true");
          // referencing .offsetHeight triggers chrome to repaint
          // otherwise lightbox may not show. Yay DOM!
          this.qs(".lightbox--content").offsetHeight;
        }.bind(this)
      );
    },

    setupChildView: function() {
      var child = this.getChild("currentView");
      if (!child.emitter.hasEvent("setup:before")) {
        child.emitter.once("render:after", this.setupChildView.bind(this), {
          immediate: true,
        });
        // todo: use a transition?
        child.setup();
      } else {
        child.addToDom(this.qs(".js-lightbox-content"));
      }
    },
  },
  lib.mixins.popoutView
);
pie.ns("lib.components").confirm = lib.activeView.extend("confirm", {
  init: function(options) {
    options = pie.object.merge(
      {
        dismissable: false,
        confirmText: ".web.rabbit.shared.categories.confirmText",
        denyText: ".web.rabbit.shared.categories.denyText",
        textClass: "centy",
        buttonsClass: "centy",
        confirmClass: "btn btn-primary",
        denyClass: "btn",
        setup: true,
      },
      options
    );

    this._super(options);

    this.el.classList.add("confirm-lightbox", "wide");
    this.promise = pie.promise.create();
  },

  setup: function() {
    this.on("click", ".js-deny", "onDeny");
    this.on("click", ".js-confirm", "onConfirm");

    this.eon("dismiss", "onDismiss");

    this._super();
  },

  _renderTemplateToEl: function() {
    var innerContent = [];

    innerContent.push(
      '<div class="row confirm-lightbox--content-row"><div class="col-12 ' +
        this.options.textClass +
        '">'
    );

    if (this.options.template) {
      innerContent.push(
        this.app.templates.render(this.options.template, this.options)
      );
    } else if (this.options.text) {
      innerContent.push(
        "<span>" + this.app.i18n.attempt(this.options.text) + "</span>"
      );
    }

    innerContent.push("</div></div>");
    innerContent.push(
      '<div class="row row--guttered confirm-lightbox--button-row row--thin"><div class="col-12 ' +
        this.options.buttonsClass +
        '">'
    );
    innerContent.push(
      '  <button class="js-confirm ' +
        this.options.confirmClass +
        '">' +
        this.app.i18n.attempt(this.options.confirmText) +
        "</button>"
    );
    innerContent.push(
      '  <button class="js-deny ' +
        this.options.denyClass +
        '">' +
        this.app.i18n.attempt(this.options.denyText) +
        "</button>"
    );
    innerContent.push("</div></div>");

    if (!innerContent) throw new Error("No content provided for confirmation!");

    this.el.innerHTML = innerContent.join("\n");
    this.emitter.fire("render:after");
  },

  onDeny: function() {
    this.bubble("hide");
    this.promise.reject();
  },

  onDismiss: function(e) {
    this.consumeEvent(e);
    this.onDeny();
  },

  onConfirm: function() {
    this.bubble("hide");
    this.promise.resolve();
  },
});
/* globals __Abacus */

pie.ns("lib.models");

lib.models.currentUser = pie.model.extend({
  init: function(data) {
    this._super(data);

    this.compute("isLoggedIn", "id");
    this.compute("inCorrectLocale", "locale");
    this.app.emitter.on(
      "start:after",
      this.showMultiUserIfNeccessary.bind(this)
    );

    this.observe(this.updateGlobals.bind(this));
  },

  showAbName: function(name) {
    return this.abDecisionArray().indexOf(name) > -1;
  },

  abDecision: function() {
    var pieces, value, seconds;

    if (app.state.get("_ab")) {
      this.abDecisionObject = { id: 0, name: app.state.get("_ab") };
      return this.abDecisionObject;
    }

    if (this.abDecisionObject) return this.abDecisionObject;

    // TODO: this might be stale if just logged in.
    // maybe this.get("ab_decision") || pie.browser.getCookie("ab")
    value = pie.browser.getCookie("ab");
    if (!value) return this.generateAbDecision();

    pieces = value.split("::");
    if (pieces.length !== 3) return this.generateAbDecision();
    if (pieces[0] === "0") return this.generateAbDecision();

    seconds = parseInt(pieces[1], 10);
    if (isNaN(seconds) || seconds < new Date().getTime() / 1000) {
      // it's old
      return this.generateAbDecision(pieces[0]);
    }

    this.abDecisionObject = { id: pieces[0], name: pieces[2] };
    return this.abDecisionObject;
  },

  abDecisionArray: function() {
    return this.abDecision()
      .name.split(":")
      .filter(function(s) {
        return s.length;
      });
  },

  addUserData: function(data) {
    data = pie.object.merge({}, data, this.get("metricData"));
    data.guid = this.guid();
    data.user_id = this.get("id");
    data.ab_decision = this.abDecision().name;
    data.ab_decision_group_id = this.abDecision().id;
    data.metric_client = "web";
    data.locale = app.config.get("locale");
    data.pathname = document.location.pathname;
    data.referrer = document.referrer;

    return data;
  },

  clientPublish: function(event_type, data, cb) {
    data.client_publish_type = event_type;
    data.locale = app.config.get("locale");

    app.ajax.post({
      url: "/api/v3/polltime/publish.json",
      success: function() {
        if (cb) cb(null);
      },
      error: function() {
        if (cb) cb("error");
      },
      data: data,
    });
  },

  generateAbDecision: function(current) {
    if (typeof __Abacus === "object") {
      this.abDecisionObject = __Abacus.pick(current);
      if (this.abDecisionObject) {
        // write cookie
        var timestamp = Math.floor(new Date().getTime() / 1000.0);
        pie.browser.setCookie(
          "ab",
          this.abDecisionObject.id +
            "::" +
            timestamp +
            "::" +
            this.abDecisionObject.name
        );
        return this.abDecisionObject;
      }
    }
    // else default
    return { id: 0, name: "control" };
  },

  getMetricData: function(key) {
    return this.get("metricData." + key);
  },

  guid: function() {
    return this.get("guid") || pie.browser.getCookie("uid");
  },

  ssoParams: function() {
    return {
      guid: this.guid(),
      ab_decision: this.abDecision().name,
      ab_decision_group_id: this.abDecision().id,
    };
  },

  isLoggedIn: function() {
    var value = this.get("id") || pie.browser.getCookie("session");
    return !!value;
  },

  isFirstTimeUser: function() {
    return this.get("poster_status") !== "returning";
  },

  inCorrectLocale: function() {
    return this.test("locale", this.app.config.get("locale"));
  },

  showMultiUserIfNeccessary: function() {
    if (this.get("multi_user") && this.get("id")) {
      var url = app.internalPath("/admin/users/" + this.get("id"));
      var banner = pie.dom.createElement(
        "<a href='" + url + "' target='_blank' class='multiuser-banner'>You are currently logged in as: " +
          this.get("full_name") +
          "</a>"
      );
      document.body.appendChild(banner);
    }
  },

  updateGlobals: function() {
    // These things are read by and important to Google Tag Manager
    // They were initialized in _async_analytics.erb
    var newGuid = this.guid();
    var newLoggedIn = this.isLoggedIn();

    window.__userLoggedIn = newLoggedIn;
    if (newGuid) {
      window.__guidValue = newGuid;
      if (newLoggedIn) {
        window.__guidValueLoggedIn = newGuid;
      } else {
        window.__guidValueLoggedIn = null;
      }
    }
  },
});
pie.ns("lib.models").pageContext = pie.model.extend("pageContext", {
  init: function(currentUser) {
    this._super({
      currentUser: currentUser.data || {},
      layout: {
        footerVisible: false,
        pressFooterVisible: false,
        headerVisible: false,
        headerStyle: "default",
        drawerVisible: false,
        drawerTriggerVisible: false,
      },
    });

    this.initialLayout = pie.object.merge({}, this.data.layout);
    this.currentUser = currentUser;

    this.compute("isLoggedIn", "currentUser.isLoggedIn");
    this.compute("isRabbit", "currentUser.rabbit");

    this.currentUser.observe(this.onCurrentUserChange.bind(this));
  },

  isLoggedIn: function() {
    return !!this.get("currentUser.isLoggedIn");
  },

  isRabbit: function() {
    return !!this.get("currentUser.rabbit");
  },

  onCurrentUserChange: function() {
    // by prepending currentUser, we allow change records to be delivered to individual keys of currentUser as well as currentUser as a whole.
    var o = pie.object.flatten(this.currentUser.data, "currentUser.");
    this.sets(o);
    // the ab decision can be provided by the url so we want to make sure we give time for the app to start and parse the url.
    this.app.emitter.on("start", this.setAbDecision.bind(this), {
      immedate: true,
    });
  },

  reset: function() {
    var o = pie.object.flatten(this.initialLayout, "layout.");
    this.sets(o);
  },

  setAbDecision: function() {
    document
      .querySelector("body")
      .setAttribute("data-ab-decision", this.currentUser.abDecision().name);
  },
});
pie.ns("lib.layout").notifier = lib.listView.extend("notifier", {
  init: function(app, el) {
    this.list = app.notifier.notifications;

    this._super({
      el: el,
      app: app,
      itemOptions: { template: "pageNotification" },
    });
  },

  setup: function() {
    this.on("click", ".js-alert-close", "handleCloseClick");
    this._super();
  },

  handleCloseClick: function(e) {
    var id = e.delegateTarget.getAttribute("data-alert-id");
    this.app.notifier.remove(id);
  },
});
pie.ns("lib.layout").page = lib.view.extend("page", {
  init: function(app) {
    this._super({
      el: document.body,
      app: app,
    });

    this.beginEventSubscriptions();

    this.on("click", ".js-header-menu-toggle", this.toggleDrawer.bind(this));
    this.on(
      "click",
      ".js-tt-trigger:not([data-tooltip-id])",
      this.showTooltip.bind(this)
    );
    this.on(
      "click",
      ".js-tt-trigger[data-tooltip-id]",
      this.consumeEvent.bind(this)
    );
    this.on("click", 'a[href="#"]', this.consumeEvent.bind(this));

    this.observe(
      this.app.pageContext,
      "evaluateDrawerVisibility",
      "layout.drawerVisible"
    );
    this.observe(this.app.pageContext, "manageBodyStyle", "layout.bodyStyle");
  },

  beginEventSubscriptions: function() {
    this.app.metrics.subscribe({
      key: "on_demand_referral_cta_visible",
      eventName: "On Demand Referral CTA Visible",
      source: ["bus"],
    });
  },

  showTooltip: function(e) {
    this.consumeEvent(e);
    var tooltip = lib.components.domTooltip.create(this.app, e.delegateTarget);
    this.addChild("tooltip-" + pie.uid(tooltip), tooltip);
    tooltip.setup();
  },

  toggleDrawer: function(e) {
    this.consumeEvent(e);
    var b = this.app.pageContext.get("layout.drawerVisible");
    this.app.pageContext.set("layout.drawerVisible", !b);
  },

  evaluateDrawerVisibility: function(changes) {
    var b = changes.get("layout.drawerVisible").value;
    document.body.classList[b ? "add" : "remove"]("is-drawer-expanded");
  },

  manageBodyStyle: function() {
    var bodyStyle = this.app.pageContext.get("layout.bodyStyle");
    if (bodyStyle)
      this.el.classList.add.apply(this.el.classList, bodyStyle.split(" ")); // this.el === body
  },
});
pie.ns("lib.layout").header = lib.activeView.extend(
  "header",
  {
    init: function(options) {
      this.pageContext = this.model = app.pageContext;

      this._super(
        pie.object.merge(
          {
            setup: true,
            template: "header",
          },
          options
        )
      );
    },

    setup: function() {
      this.on("click", ".js-taskrabbit-logo", this.handleLogoClick.bind(this));

      this.observe(
        this.pageContext,
        "render",
        "isLoggedIn",
        "currentUser.inCorrectLocale"
      );
      this.observe(
        this.pageContext,
        "manageVisibility",
        "layout.headerVisible"
      );
      this.observe(
        this.pageContext,
        "manageLinksVisibility",
        "layout.headerLinksVisible"
      );
      this.observe(this.pageContext, "manageStyle", "layout.headerStyle");
      this.observe(
        this.pageContext,
        "manageToggleCondition",
        "layout.drawerVisible"
      );
      this.observe(this.pageContext, "buildHeaderReferralCta", "referral");

      this.eon("render:after", "manageVisibility", { now: true });
      this.eon("render:after", "manageLinksVisibility", { now: true });
      this.eon("render:after", "manageStyle", { now: true });
      this.eon("render:after", "manageNavs");
      this.on(
        "click",
        ".js-show-referral-modal",
        this.referralRedirect.bind(this)
      );
      this.on(
        "mouseover",
        ".js__services-trigger",
        this.showServicesList.bind(this)
      );
      this.on(
        "mouseout",
        ".js__services-trigger",
        this.hideServicesList.bind(this)
      );

      this._super();
    },

    handleLogoClick: function() {
      var shouldRestrict = this.pageContext.get("layout.restrictLogoClick");
      var clickDest = app.internalPath(this.currentUser().isLoggedIn() ? "/dashboard" : "/");

      if (shouldRestrict) {
        this.app
          .confirm(
            {
              confirmText: ".web.build.confirm_nav.confirmText",
              denyText: ".web.build.confirm_nav.denyText",
              text: ".web.build.confirm_nav.body",
            },
            ".web.build.confirm_nav.title"
          )
          .then(function() {
            window.location.href = clickDest;
          });
      } else {
        window.location.href = clickDest;
      }
    },

    manageVisibility: function() {
      var value = this.pageContext.get("layout.headerVisible");
      this.el.classList[value ? "remove" : "add"]("is-hidden");
    },

    manageLinksVisibility: function() {
      var value = this.pageContext.get("layout.headerLinksVisible");
      var showLinks = value !== false;

      this.el.classList[showLinks ? "remove" : "add"]("links-hidden");
    },

    manageStyle: function() {
      document.body.setAttribute(
        "data-header-style",
        this.pageContext.get("layout.headerStyle")
      );
    },

    manageToggleCondition: function() {
      var value = this.pageContext.get("layout.drawerVisible");

      this.qs(".js-header-menu-toggle").classList[!value ? "remove" : "add"](
        "is-expanded"
      );
      this.qs(".js-page-header-menu-toggle").classList[
        !value ? "remove" : "add"
      ]("is-expanded");
    },

    manageNavs: function() {
      var navs = ["mobile", "desktop"];
      navs.forEach(
        function(nav) {
          var child = this.getChild(nav);
          if (child) {
            child.teardown();
            this.removeChild(child);
          }

          child = lib.layout.nav.create({
            el: this.qs(".js-header-navigation--" + nav),
          });
          this.addChild(nav, child);
          child.setup();
        }.bind(this)
      );
    },

    buildHeaderReferralCta: function() {
      document.addEventListener("DOMContentLoaded", function() {
        if (!this.currentUser) {
          return;
        }
        var referralData = this.getReferralData();
        var visibleLink = false;

        if (!referralData) {
          console.log("Referral data not received");
          return;
        }

        if (!referralData["referral_cta"]) {
          return;
        }

        ["desktop", "mobile"].forEach(function(deviceType) {
          var link = document.querySelector(
            ".js-header-navigation--" + deviceType + " .js-show-referral-modal"
          );

          var linkTextEl = document.querySelector(
            ".js-header-navigation--" + deviceType + " .js-referralCtaText"
          );
          var linkText = referralData["referral_cta"];

          if (linkText) {
            link.classList.remove("is-hidden");
            linkTextEl.textContent = linkText;
            visibleLink = true;
            link.classList.add("show-icon");
          }
        });

        if (visibleLink) {
          this.fireReferralEvent("on_demand_referral_cta_visible", {
            source: "header",
          });
        }
      });
    },

    showServicesList: function(e) {
      var desktopNav = document.querySelector(".js-header-navigation--desktop");
      desktopNav
        .querySelector(".js__services-dropdown")
        .classList.remove("is-hidden");
      desktopNav
        .querySelector(".js__services-link")
        .classList.add("is-focused");
    },

    hideServicesList: function(e) {
      var desktopNav = document.querySelector(".js-header-navigation--desktop");
      desktopNav
        .querySelector(".js__services-dropdown")
        .classList.add("is-hidden");
      desktopNav
        .querySelector(".js__services-link")
        .classList.remove("is-focused");
    },
  },
  lib.mixins.referrals
);
pie.ns("lib.layout").footer = lib.activeView.extend(
  "footer",
  {
    init: function(el) {
      this.model = app.pageContext;

      this._super({
        el: el,
        template: "footer",
        setup: true,
      });
    },

    setup: function() {
      this.observe(
        this.model,
        "manageFooterVisibility",
        "layout.footerVisible"
      );
      this.observe(
        this.model,
        "managePressFooterVisibility",
        "layout.pressFooterVisible"
      );
      this.observe(this.model, "buildFooterReferralCta", "referral");

      this.eon("render:after", "manageFooterVisibility", { now: true });
      this.eon("render:after", "managePressFooterVisibility");

      this.on(
        "click",
        ".js-show-referral-modal",
        this.referralRedirect.bind(this, { source: "footer" })
      );

      this._super();
    },

    _manageVisibility: function(el, value) {
      if (el) {
        el.classList[value ? "remove" : "add"]("is-hidden");
        el.classList[value ? "add" : "remove"]("is-visible");
      }
    },

    manageFooterVisibility: function() {
      var value = this.model.get("layout.footerVisible");
      this._manageVisibility(this.el, value);

      // todo: css refactor
      // temporary until we remove the old css.
      this._manageVisibility(this.qs(".footer-container"), value);
    },

    managePressFooterVisibility: function() {
      var el = this.qs(".js-press-container"),
        value = this.model.get("layout.pressFooterVisible");

      this._manageVisibility(el, value);
    },

    buildFooterReferralCta: function() {
      var referralData = this.getReferralData();

      if (!referralData) {
        console.log("Referral data not received");
        return;
      }

      if (referralData["referral_cta"]) {
        var link = this.qs(".js-show-referral-modal");
        if (link == null) {
          if (window && window.Bugsnag && window.Bugsnag.notifyException) {
            window.Bugsnag.notifyException(
              new Error("No footer referral link found"),
              {}
            );
          }
          return;
        }
        var linkTextEl = link.querySelector(".js-referralCtaText");
        var linkText = referralData["referral_cta"];

        if (linkText) {
          link.classList.remove("is-hidden");
          linkTextEl.textContent = linkText;
          this.scrollEventListener();
        }
      }
    },

    scrollEventListener: function() {
      var detectVisibility = function(e) {
        var ticking = false;
        if (!ticking) {
          window.requestAnimationFrame(
            function() {
              var el = document.querySelector(
                ".footer-column .js-show-referral-modal"
              );
              if (el) {
                var elemTop = el.getBoundingClientRect().top;
                var elemBottom = el.getBoundingClientRect().bottom;

                if (elemTop >= 0 && elemBottom <= window.innerHeight) {
                  window.removeEventListener("scroll", detectVisibility);
                  this.fireReferralEvent("on_demand_referral_cta_visible", {
                    source: "footer",
                  });
                }
                ticking = false;
              }
            }.bind(this)
          );
        }
        ticking = true;
      }.bind(this);

      window.addEventListener("scroll", detectVisibility);
      //
    },
  },
  lib.mixins.referrals
);
pie.ns("lib.components");

lib.components.countdown = function (options) {
  this.options = options || {};
  this.timeout = null;
  this.show_promo_time = false;
  this.pid = null;
  this.el = null;
};

lib.components.countdown.prototype.start = function () {
  app.pageContext.get("currentPromo").then(
    function (data) {
      data = pie.object.merge({}, data);
      if (data.is_countdown_banner && !data.is_seasonal_banner) {
        var existingCookie = pie.browser.getCookie("trpromo"),
          startTime = existingCookie ? JSON.parse(existingCookie).time : null,
          promoIsChanged = existingCookie
            ? JSON.parse(existingCookie).id === data.id
            : null,
          newCookieValue;

        if (!startTime || !promoIsChanged) {
          startTime = new Date().getTime();

          newCookieValue = JSON.stringify({
            id: data.id,
            time: startTime,
          });
          pie.browser.setCookie("trpromo", newCookieValue, {
            path: app.internalPath("/"),
          });
        }

        this.options.text = data.banner_text;
        this.options.promoCode = data.code;
        this.options.duration = data.banner_countdown_minutes * 1000 * 60;
        this.show_promo_time = data.show_promo_time;

        startTime = parseInt(startTime, 10);
        this.timeout = startTime + this.options.duration;

        this.pid = setInterval(this.tick.bind(this), 1000);
      }
    }.bind(this)
  );
};

lib.components.countdown.prototype.tick = function () {
  var now = new Date().getTime();
  var diff = this.timeout - now;
  var chatContainer = document.getElementsByClassName(
    "chat-container__inputs-wrapper"
  );
  this.render(diff, this.show_promo_time);
  if (diff <= 0 || chatContainer.length > 0) {
    this.finish();
    return;
  }
};

lib.components.countdown.prototype.finish = function () {
  if (this.el && this.el.parentNode) {
    this.el.parentNode.removeChild(this.pushEl);
    this.el.parentNode.removeChild(this.el);
  }

  if (this.pid) {
    clearInterval(this.pid);
    this.pid = null;
  }
};

lib.components.countdown.prototype.render = function (
  timeDiff,
  show_promo_time
) {
  var minutes = parseInt(timeDiff / (1000 * 60), 10);
  var seconds = parseInt((timeDiff / 1000) % 60, 10);
  minutes = String(Math.max(minutes, 0));
  seconds = String(Math.max(seconds, 0));

  if (minutes.length < 2) minutes = "0" + minutes;
  if (seconds.length < 2) seconds = "0" + seconds;
  if (!this.el) {
    this.el = document.createElement("div");
    this.el.classList.add("tr-promo-container");

    this.pushEl = document.createElement("div");
    this.pushEl.classList.add("tr-promo-container-push");
    this.pushEl.innerHTML = "&nbsp;";

    var promoText = this.options.text;
    promoText = promoText.split(this.options.promoCode);
    promoText = promoText.join(
      '<span class="tr-promo-inner__promoCode">' +
        this.options.promoCode +
        "</span>"
    );

    this.el.innerHTML = [
      '<div class="tr-promo-inner">',
      promoText,
      '  <span data-behavior="timer">',
      '    <span class="timing-break"></span>',
      '    <span class="js-minute time-component"></span>',
      '    <span class="time-component">:</span>',
      '    <span class="js-second time-component"></span>',
      "  </span>",
      "</div>",
      '<a href="#" class="promo-close-icon"><i class="ss-cross"></i></a>',
    ].join("");

    var timerContainer = this.el.querySelector('span[data-behavior="timer"]');
    if (true !== show_promo_time) timerContainer.style.display = "none";

    this.minuteEl = this.el.querySelector(".js-minute");
    this.secondEl = this.el.querySelector(".js-second");
    this.closeButton = this.el.querySelector(".promo-close-icon");

    document.body.appendChild(this.el);
    document.body.appendChild(this.pushEl);
    this.pushEl.style.flexBasis = this.el.scrollHeight + 'px';

    pie.dom.on(this.el, "click", this.onClick.bind(this));
    pie.dom.on(this.closeButton, "click", this.closePromoBanner.bind(this));
  }

  this.minuteEl.innerHTML = minutes;
  this.secondEl.innerHTML = seconds;
};

lib.components.countdown.prototype.closePromoBanner = function () {
  this.finish();
};

lib.components.countdown.prototype.onClick = function (e) {
  if (e) e.preventDefault();

  if (this.options.redirectUrl) {
    window.location.href = app.internalPath(this.options.redirectUrl);
  }
};
pie.ns("lib.components");

lib.components.seasonalBanner = function(options) {
  this.options = options || {};
  var content = document.querySelector('script[id="seasonal-banner"]')
    .innerHTML;
  this.template = pie.string.template(content);
  app.state.observe(this.render.bind(this));
};

lib.components.seasonalBanner.prototype.render = function() {
  var shouldHide = app.state.get("__route._nameWithinParent") === "chat";

  app.pageContext.get("currentPromo").then(
    function(data) {
      data = pie.object.merge({}, data);
      if (data.is_seasonal_banner) {
        if (!this.el) {
          this.el = document.createElement("div");

          this.el.innerHTML = this.template(data);

          document.body.appendChild(this.el);

          pie.dom.on(
            this.el,
            "click",
            this.handleBannerClick.bind(this),
            ".js-expansion-trigger, .js-seasonal-banner__underlay"
          );
        }

        if (app.state.get("__route._nameWithinParent") === "build") {
          var cta = this.el.querySelector(".js-cta");
          if (cta) cta.classList.add("is-hidden");
        }

        //hide on chat page
        this.el.classList[shouldHide ? "add" : "remove"]("is-hidden");
      }
    }.bind(this)
  );
};

lib.components.seasonalBanner.prototype.handleBannerClick = function(e) {
  if (e) e.preventDefault();
  var banner = this.el.querySelector(".seasonal-banner");

  banner.classList.toggle("seasonal-banner--expanded");
};
! function() {
  "use strict";
  var e = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

  function P(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
  } {
    var U, O, L, M, F, G, J, H, Y, n = {
        exports: {}
      },
      t, t = (t = function(e) {
        return e && e.Math == Math && e
      })("object" == typeof globalThis && globalThis) || t("object" == typeof window && window) || t("object" == typeof self && self) || t("object" == typeof e && e) || function() {
        return this
      }() || Function("return this")(),
      e = {},
      o = function(e) {
        try {
          return !!e()
        } catch (e) {
          return !0
        }
      },
      i, i = !(i = o)(function() {
        return 7 != Object.defineProperty({}, 1, {
          get: function() {
            return 7
          }
        })[1]
      }),
      q = {},
      V = {}.propertyIsEnumerable,
      W = Object.getOwnPropertyDescriptor,
      K = W && !V.call({
        1: 2
      }, 1),
      K = (q.f = K ? function(e) {
        e = W(this, e);
        return !!e && e.enumerable
      } : V, function(e, n) {
        return {
          enumerable: !(1 & e),
          configurable: !(2 & e),
          writable: !(4 & e),
          value: n
        }
      }),
      X = {}.toString,
      V, z = o,
      Z = V = function(e) {
        return X.call(e).slice(8, -1)
      },
      $ = "".split,
      z, ee, ne = z = z(function() {
        return !Object("z").propertyIsEnumerable(0)
      }) ? function(e) {
        return "String" == Z(e) ? $.call(e, "") : Object(e)
      } : Object,
      te = ee = function(e) {
        if (null == e) throw TypeError("Can't call method on " + e);
        return e
      },
      oe = function(e) {
        return ne(te(e))
      },
      a = function(e) {
        return "object" == typeof e ? null !== e : "function" == typeof e
      },
      ie = {},
      ae = ie,
      re = t,
      ce = function(e) {
        return "function" == typeof e ? e : void 0
      },
      le = function(e, n) {
        return arguments.length < 2 ? ce(ae[e]) || ce(re[e]) : ae[e] && ae[e][n] || re[e] && re[e][n]
      },
      se, se, r, c = se = (se = le)("navigator", "userAgent") || "",
      ge = (r = t).process,
      r = r.Deno,
      ge = ge && ge.versions || r && r.version,
      r;
    (r = ge && ge.v8) ? s = (l = r.split("."))[0] < 4 ? 1 : l[0] + l[1]: c && (!(l = c.match(/Edge\/(\d+)/)) || 74 <= l[1]) && (l = c.match(/Chrome\/(\d+)/)) && (s = l[1]);
    var ge, fe = ge = s && +s,
      r = o,
      c = !!Object.getOwnPropertySymbols && !r(function() {
        var e = Symbol();
        return !String(e) || !(Object(e) instanceof Symbol) || !Symbol.sham && fe && fe < 41
      }),
      l, s = (l = c) && !Symbol.sham && "symbol" == typeof Symbol.iterator,
      he = le,
      r, l = (r = s) ? function(e) {
        return "symbol" == typeof e
      } : function(e) {
        var n = he("Symbol");
        return "function" == typeof n && Object(e) instanceof n
      },
      pe = a,
      r = {
        exports: {}
      },
      Ae = t,
      de = t,
      g = function(n, t) {
        try {
          Object.defineProperty(Ae, n, {
            value: t,
            configurable: !0,
            writable: !0
          })
        } catch (e) {
          Ae[n] = t
        }
        return t
      },
      me = "__core-js_shared__",
      de, g, ue = g = de = t[me] || g(me, {}),
      be = ((r.exports = function(e, n) {
        return ue[e] || (ue[e] = void 0 !== n ? n : {})
      })("versions", []).push({
        version: "3.17.2",
        mode: "pure",
        copyright: "© 2021 Denis Pushkarev (zloirock.ru)"
      }), ee),
      me, ke = me = function(e) {
        return Object(be(e))
      },
      je = {}.hasOwnProperty,
      de = Object.hasOwn || function(e, n) {
        return je.call(ke(e), n)
      },
      Ie = 0,
      Ee = Math.random(),
      Ce = function(e) {
        return "Symbol(" + String(void 0 === e ? "" : e) + ")_" + (++Ie + Ee).toString(36)
      },
      f = t,
      h = r.exports,
      ve = de,
      p = Ce,
      ye = c,
      Be = h("wks"),
      we = f.Symbol,
      Qe = s ? we : we && we.withoutSetter || p,
      h, Se = a,
      Te = l,
      De = function(e, n) {
        var t, o;
        if ("string" === n && "function" == typeof(t = e.toString) && !pe(o = t.call(e))) return o;
        if ("function" == typeof(t = e.valueOf) && !pe(o = t.call(e))) return o;
        if ("string" === n || "function" != typeof(t = e.toString) || pe(o = t.call(e))) throw TypeError("Can't convert object to primitive value");
        return o
      },
      f, _e = (f = h = function(e) {
        return ve(Be, e) && (ye || "string" == typeof Be[e]) || (ye && ve(we, e) ? Be[e] = we[e] : Be[e] = Qe("Symbol." + e)), Be[e]
      })("toPrimitive"),
      Re = function(e, n) {
        if (!Se(e) || Te(e)) return e;
        var t = e[_e];
        if (void 0 === t) return De(e, n = void 0 === n ? "number" : n);
        if (t = t.call(e, n = void 0 === n ? "default" : n), !Se(t) || Te(t)) return t;
        throw TypeError("Can't convert object to primitive value")
      },
      xe = l,
      s = function(e) {
        e = Re(e, "string");
        return xe(e) ? e : String(e)
      },
      p, f = a,
      Ne = (p = t).document,
      Pe = f(Ne) && f(Ne.createElement),
      p, f, A = o,
      Ue = p = function(e) {
        return Pe ? Ne.createElement(e) : {}
      },
      f = !(f = i) && !A(function() {
        return 7 != Object.defineProperty(Ue("div"), "a", {
          get: function() {
            return 7
          }
        }).a
      }),
      A = i,
      Oe = q,
      Le = K,
      Me = oe,
      Fe = s,
      Ge = de,
      Je = f,
      He = Object.getOwnPropertyDescriptor,
      Ye = (e.f = A ? He : function(e, n) {
        if (e = Me(e), n = Fe(n), Je) try {
          return He(e, n)
        } catch (e) {}
        if (Ge(e, n)) return Le(!Oe.f.call(e, n), e[n])
      }, o),
      qe = /#|\.prototype\./,
      A, Ve = (A = function(e, n) {
        e = We[Ve(e)];
        return e == Xe || e != Ke && ("function" == typeof n ? Ye(n) : !!n)
      }).normalize = function(e) {
        return String(e).replace(qe, ".").toLowerCase()
      },
      We = A.data = {},
      Ke = A.NATIVE = "N",
      Xe = A.POLYFILL = "P",
      ze, Ze = ze = function(e) {
        if ("function" != typeof e) throw TypeError(String(e) + " is not a function");
        return e
      },
      $e = function(o, i, e) {
        if (Ze(o), void 0 === i) return o;
        switch (e) {
          case 0:
            return function() {
              return o.call(i)
            };
          case 1:
            return function(e) {
              return o.call(i, e)
            };
          case 2:
            return function(e, n) {
              return o.call(i, e, n)
            };
          case 3:
            return function(e, n, t) {
              return o.call(i, e, n, t)
            }
        }
        return function() {
          return o.apply(i, arguments)
        }
      },
      en = {},
      nn = a,
      tn = function(e) {
        if (nn(e)) return e;
        throw TypeError(String(e) + " is not an object")
      },
      on = i,
      an = f,
      rn = tn,
      cn = s,
      ln = Object.defineProperty,
      f = (en.f = i ? ln : function(e, n, t) {
        if (rn(e), n = cn(n), rn(t), an) try {
          return ln(e, n, t)
        } catch (e) {}
        if ("get" in t || "set" in t) throw TypeError("Accessors not supported");
        return "value" in t && (e[n] = t.value), e
      }, i),
      sn = en,
      gn = K,
      on, fn = t,
      hn = e.f,
      pn = A,
      An = ie,
      dn = $e,
      mn = on = f ? function(e, n, t) {
        return sn.f(e, n, gn(1, t))
      } : function(e, n, t) {
        return e[n] = t, e
      },
      un = de,
      bn = function(o) {
        function e(e, n, t) {
          if (this instanceof o) {
            switch (arguments.length) {
              case 0:
                return new o;
              case 1:
                return new o(e);
              case 2:
                return new o(e, n)
            }
            return new o(e, n, t)
          }
          return o.apply(this, arguments)
        }
        return e.prototype = o.prototype, e
      },
      f = function(e, n) {
        var t, o, i, a, r, c = e.target,
          l = e.global,
          s = e.stat,
          g = e.proto,
          f = l ? fn : s ? fn[c] : (fn[c] || {}).prototype,
          h = l ? An : An[c] || mn(An, c, {})[c],
          p = h.prototype;
        for (t in n) a = !pn(l ? t : c + (s ? "." : "#") + t, e.forced) && f && un(f, t), i = h[t], a && (r = e.noTargetGet ? (r = hn(f, t)) && r.value : f[t]), o = a && r ? r : n[t], a && typeof i == typeof o || (a = e.bind && a ? dn(o, fn) : e.wrap && a ? bn(o) : g && "function" == typeof o ? dn(Function.call, o) : o, (e.sham || o && o.sham || i && i.sham) && mn(a, "sham", !0), mn(h, t, a), g && (un(An, i = c + "Prototype") || mn(An, i, {}), mn(An[i], t, o), e.real && p && !p[t] && mn(p, t, o)))
      },
      kn = V,
      jn = Array.isArray || function(e) {
        return "Array" == kn(e)
      },
      In = Math.ceil,
      En = Math.floor,
      Cn = function(e) {
        return isNaN(e = +e) ? 0 : (0 < e ? En : In)(e)
      },
      vn = Cn,
      yn = Math.min,
      Bn = function(e) {
        return 0 < e ? yn(vn(e), 9007199254740991) : 0
      },
      wn = s,
      Qn = en,
      Sn = K,
      Tn = function(e, n, t) {
        n = wn(n);
        n in e ? Qn.f(e, n, Sn(0, t)) : e[n] = t
      },
      Dn = a,
      _n = jn,
      Rn, xn = (Rn = h)("species"),
      Nn = function(e) {
        var n;
        return void 0 === (n = _n(e) && ("function" == typeof(n = e.constructor) && (n === Array || _n(n.prototype)) || Dn(n) && null === (n = n[xn])) ? void 0 : n) ? Array : n
      },
      Rn = function(e, n) {
        return new(Nn(e))(0 === n ? 0 : n)
      },
      Pn = o,
      Un, On = ge,
      Ln = (Un = h)("species"),
      Un, Mn = f,
      Fn = o,
      Gn = jn,
      Jn = a,
      Hn = me,
      Yn = Bn,
      qn = Tn,
      Vn = Rn,
      Wn = Un = function(n) {
        return 51 <= On || !Pn(function() {
          var e = [];
          return (e.constructor = {})[Ln] = function() {
            return {
              foo: 1
            }
          }, 1 !== e[n](Boolean).foo
        })
      },
      Kn, Xn = ge,
      zn = (Kn = h)("isConcatSpreadable"),
      Zn = 9007199254740991,
      $n = "Maximum allowed index exceeded",
      Kn = 51 <= Xn || !Fn(function() {
        var e = [];
        return e[zn] = !1, e.concat()[0] !== e
      }),
      Xn = Wn("concat"),
      Fn, et = (Mn({
        target: "Array",
        proto: !0,
        forced: Fn = !Kn || !Xn
      }, {
        concat: function(e) {
          for (var n, t, o, i = Hn(this), a = Vn(i, 0), r = 0, c = -1, l = arguments.length; c < l; c++)
            if (function(e) {
              if (!Jn(e)) return !1;
              var n = e[zn];
              return void 0 !== n ? !!n : Gn(e)
            }(o = -1 === c ? i : arguments[c])) {
              if (t = Yn(o.length), Zn < r + t) throw TypeError($n);
              for (n = 0; n < t; n++, r++) n in o && qn(a, r, o[n])
            } else {
              if (Zn <= r) throw TypeError($n);
              qn(a, r++, o)
            } return a.length = r, a
        }
      }), l),
      Wn = function(e) {
        if (et(e)) throw TypeError("Cannot convert a Symbol value to a string");
        return String(e)
      },
      nt = Cn,
      tt = Math.max,
      ot = Math.min,
      Kn, it = oe,
      at = Bn,
      rt = Kn = function(e, n) {
        e = nt(e);
        return e < 0 ? tt(e + n, 0) : ot(e, n)
      },
      Xn, Mn = {
        includes: (Xn = function(c) {
          return function(e, n, t) {
            var o, i = it(e),
              a = at(i.length),
              r = rt(t, a);
            if (c && n != n) {
              for (; r < a;)
                if ((o = i[r++]) != o) return !0
            } else
              for (; r < a; r++)
                if ((c || r in i) && i[r] === n) return c || r || 0;
            return !c && -1
          }
        })(!0),
        indexOf: Xn(!1)
      },
      Fn = {},
      ct = de,
      lt = oe,
      st = Mn.indexOf,
      gt = Fn,
      Xn, ft, ht = Xn = function(e, n) {
        var t, o = lt(e),
          i = 0,
          a = [];
        for (t in o) !ct(gt, t) && ct(o, t) && a.push(t);
        for (; n.length > i;) !ct(o, t = n[i++]) || ~st(a, t) || a.push(t);
        return a
      },
      pt = ft = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"],
      At = Object.keys || function(e) {
        return ht(e, pt)
      },
      dt = i,
      mt = en,
      ut = tn,
      bt = At,
      dt = i ? Object.defineProperties : function(e, n) {
        ut(e);
        for (var t, o = bt(n), i = o.length, a = 0; a < i;) mt.f(e, t = o[a++], n[t]);
        return e
      },
      d, d = (d = le)("document", "documentElement"),
      m = r.exports,
      kt = Ce,
      jt = m("keys"),
      m, It = tn,
      Et = dt,
      Ct = ft,
      vt = Fn,
      yt = d,
      Bt = p,
      wt, Qt = "prototype",
      St = "script",
      Tt = (wt = m = function(e) {
        return jt[e] || (jt[e] = kt(e))
      })("IE_PROTO"),
      Dt = function() {},
      _t = function(e) {
        return "<" + St + ">" + e + "</" + St + ">"
      },
      Rt = function(e) {
        e.write(_t("")), e.close();
        var n = e.parentWindow.Object;
        return e = null, n
      },
      xt = function() {
        try {
          U = new ActiveXObject("htmlfile")
        } catch (e) {}
        xt = "undefined" == typeof document || document.domain && U ? Rt(U) : (e = Bt("iframe"), n = "java" + St + ":", e.style.display = "none", yt.appendChild(e), e.src = String(n), (n = e.contentWindow.document).open(), n.write(_t("document.F=Object")), n.close(), n.F);
        for (var e, n, t = Ct.length; t--;) delete xt[Qt][Ct[t]];
        return xt()
      },
      wt = (vt[Tt] = !0, Object.create || function(e, n) {
        var t;
        return null !== e ? (Dt[Qt] = It(e), t = new Dt, Dt[Qt] = null, t[Tt] = e) : t = xt(), void 0 === n ? t : Et(t, n)
      }),
      vt = {},
      Nt = Xn,
      Xn, Pt = (Xn = ft).concat("length", "prototype"),
      ft = (vt.f = Object.getOwnPropertyNames || function(e) {
        return Nt(e, Pt)
      }, {}),
      Ut = oe,
      Ot = vt.f,
      Lt = {}.toString,
      Mt = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
    ft.f = function(e) {
      if (!Mt || "[object Window]" != Lt.call(e)) return Ot(Ut(e));
      try {
        return Ot(e)
      } catch (e) {
        return Mt.slice()
      }
    };
    var Xn, Ft = ((Xn = {}).f = Object.getOwnPropertySymbols, on),
      Gt = function(e, n, t, o) {
        o && o.enumerable ? e[n] = t : Ft(e, n, t)
      },
      u, b = h,
      Jt = ((u = {}).f = b, ie),
      Ht = de,
      Yt = u,
      qt = en.f,
      b = function(e) {
        var n = Jt.Symbol || (Jt.Symbol = {});
        Ht(n, e) || qt(n, e, {
          value: Yt.f(e)
        })
      },
      k, k, Vt;
    (Vt = {})[k = (k = h)("toStringTag")] = "z";
    var k, Vt = k = "[object z]" === String(Vt),
      Wt = V,
      Kt = h,
      Xt = Kt("toStringTag"),
      zt = "Arguments" == Wt(function() {
        return arguments
      }()),
      Kt, Vt, Zt = Kt = Vt ? Wt : function(e) {
        var n;
        return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof(n = function(e, n) {
          try {
            return e[n]
          } catch (e) {}
        }(e = Object(e), Xt)) ? n : zt ? Wt(e) : "Object" == (n = Wt(e)) && "function" == typeof e.callee ? "Arguments" : n
      },
      Vt = (Vt = k) ? {}.toString : function() {
        return "[object " + Zt(this) + "]"
      },
      $t = k,
      eo = en.f,
      no = on,
      to = de,
      oo = Vt,
      k, io = (k = h)("toStringTag"),
      Vt = function(e, n, t, o) {
        e && (t = t ? e : e.prototype, to(t, io) || eo(t, io, {
          configurable: !0,
          value: n
        }), o && !$t && no(t, "toString", oo))
      },
      k = g,
      ao = Function.toString;
    "function" != typeof k.inspectSource && (k.inspectSource = function(e) {
      return ao.call(e)
    });
    var k, ro = t,
      co = k = k.inspectSource,
      ro, co, ro = co = "function" == typeof(ro = t.WeakMap) && /native code/.test(co(ro)),
      co, lo = a,
      so = on,
      go = de,
      j = m,
      I = Fn,
      fo = "Object already initialized",
      co = (co = t).WeakMap,
      ro = (H = ro || g.state ? (O = g.state || (g.state = new co), L = O.get, M = O.has, F = O.set, G = function(e, n) {
        if (M.call(O, e)) throw new TypeError(fo);
        return n.facade = e, F.call(O, e, n), n
      }, J = function(e) {
        return L.call(O, e) || {}
      }, function(e) {
        return M.call(O, e)
      }) : (I[Y = j("state")] = !0, G = function(e, n) {
        if (go(e, Y)) throw new TypeError(fo);
        return n.facade = e, so(e, Y, n), n
      }, J = function(e) {
        return go(e, Y) ? e[Y] : {}
      }, function(e) {
        return go(e, Y)
      }), {
        set: G,
        get: J,
        has: H,
        enforce: function(e) {
          return H(e) ? J(e) : G(e, {})
        },
        getterFor: function(n) {
          return function(e) {
            if (lo(e) && (e = J(e)).type === n) return e;
            throw TypeError("Incompatible receiver, " + n + " required")
          }
        }
      }),
      ho = $e,
      po = z,
      Ao = me,
      mo = Bn,
      uo = Rn,
      bo = [].push,
      g, co = {
        forEach: (g = function(h) {
          var p = 1 == h,
            A = 2 == h,
            d = 3 == h,
            m = 4 == h,
            u = 6 == h,
            b = 7 == h,
            k = 5 == h || u;
          return function(e, n, t, o) {
            for (var i, a, r = Ao(e), c = po(r), l = ho(n, t, 3), s = mo(c.length), g = 0, n = o || uo, f = p ? n(e, s) : A || b ? n(e, 0) : void 0; g < s; g++)
              if ((k || g in c) && (a = l(i = c[g], g, r), h))
                if (p) f[g] = a;
                else if (a) switch (h) {
                  case 3:
                    return !0;
                  case 5:
                    return i;
                  case 6:
                    return g;
                  case 2:
                    bo.call(f, i)
                } else switch (h) {
                  case 4:
                    return !1;
                  case 7:
                    bo.call(f, i)
                }
            return u ? -1 : d || m ? m : f
          }
        })(0),
        map: g(1),
        filter: g(2),
        some: g(3),
        every: g(4),
        find: g(5),
        findIndex: g(6),
        filterReject: g(7)
      },
      I = f,
      j = t,
      g = le,
      ko = i,
      jo = o,
      E = de,
      Io = jn,
      Eo = a,
      Co = l,
      vo = tn,
      yo = me,
      Bo = oe,
      wo = s,
      Qo = Wn,
      So = K,
      To = wt,
      Do = At,
      l = vt,
      s = ft,
      _o = Xn,
      C = e,
      v = en,
      Ro = q,
      xo = on,
      No = Gt,
      r = r.exports,
      Po = m,
      Uo = Fn,
      Oo = Ce,
      Lo = h,
      Mo = u,
      Fo = b,
      Go = Vt,
      y = ro,
      Jo = co.forEach,
      Ho = Po("hidden"),
      Yo = "Symbol",
      qo = "prototype",
      Po = Lo("toPrimitive"),
      Vo = y.set,
      Wo = y.getterFor(Yo),
      Ko = Object[qo],
      Xo = j.Symbol,
      zo = g("JSON", "stringify"),
      Zo = C.f,
      $o = v.f,
      ei = s.f,
      ni = Ro.f,
      ti = r("symbols"),
      oi = r("op-symbols"),
      ii = r("string-to-symbol-registry"),
      ai = r("symbol-to-string-registry"),
      y = r("wks"),
      g, ri = !(g = j.QObject) || !g[qo] || !g[qo].findChild,
      ci = ko && jo(function() {
        return 7 != To($o({}, "a", {
          get: function() {
            return $o(this, "a", {
              value: 7
            }).a
          }
        })).a
      }) ? function(e, n, t) {
        var o = Zo(Ko, n);
        o && delete Ko[n], $o(e, n, t), o && e !== Ko && $o(Ko, n, o)
      } : $o,
      li = function(e, n) {
        var t = ti[e] = To(Xo[qo]);
        return Vo(t, {
          type: Yo,
          tag: e,
          description: n
        }), ko || (t.description = n), t
      },
      si = function(e, n, t) {
        e === Ko && si(oi, n, t), vo(e);
        n = wo(n);
        return vo(t), E(ti, n) ? (t.enumerable ? (E(e, Ho) && e[Ho][n] && (e[Ho][n] = !1), t = To(t, {
          enumerable: So(0, !1)
        })) : (E(e, Ho) || $o(e, Ho, So(1, {})), e[Ho][n] = !0), ci(e, n, t)) : $o(e, n, t)
      },
      gi = function(n, e) {
        vo(n);
        var t = Bo(e),
          e = Do(t).concat(hi(t));
        return Jo(e, function(e) {
          ko && !fi.call(t, e) || si(n, e, t[e])
        }), n
      },
      fi = function(e) {
        var e = wo(e),
          n = ni.call(this, e);
        return !(this === Ko && E(ti, e) && !E(oi, e)) && (!(n || !E(this, e) || !E(ti, e) || E(this, Ho) && this[Ho][e]) || n)
      },
      r = function(e, n) {
        var t, e = Bo(e),
          n = wo(n);
        if (e !== Ko || !E(ti, n) || E(oi, n)) return t = Zo(e, n), !t || !E(ti, n) || E(e, Ho) && e[Ho][n] || (t.enumerable = !0), t
      },
      j = function(e) {
        var e = ei(Bo(e)),
          n = [];
        return Jo(e, function(e) {
          E(ti, e) || E(Uo, e) || n.push(e)
        }), n
      },
      hi = function(e) {
        var n = e === Ko,
          e = ei(n ? oi : Bo(e)),
          t = [];
        return Jo(e, function(e) {
          !E(ti, e) || n && !E(Ko, e) || t.push(ti[e])
        }), t
      },
      g, No, Ro, v;
    c || (No((Xo = function() {
      if (this instanceof Xo) throw TypeError("Symbol is not a constructor");
      var e = arguments.length && void 0 !== arguments[0] ? Qo(arguments[0]) : void 0,
        n = Oo(e),
        t = function(e) {
          this === Ko && t.call(oi, e), E(this, Ho) && E(this[Ho], n) && (this[Ho][n] = !1), ci(this, n, So(1, e))
        };
      return ko && ri && ci(Ko, n, {
        configurable: !0,
        set: t
      }), li(n, e)
    })[qo], "toString", function() {
      return Wo(this).tag
    }), No(Xo, "withoutSetter", function(e) {
      return li(Oo(e), e)
    }), Ro.f = fi, v.f = si, C.f = r, l.f = s.f = j, _o.f = hi, Mo.f = function(e) {
      return li(Lo(e), e)
    }, ko && $o(Xo[qo], "description", {
      configurable: !0,
      get: function() {
        return Wo(this).description
      }
    })), I({
      global: !0,
      wrap: !0,
      forced: !c,
      sham: !c
    }, {
      Symbol: Xo
    }), Jo(Do(y), function(e) {
      Fo(e)
    }), I({
      target: Yo,
      stat: !0,
      forced: !c
    }, {
      for: function(e) {
        e = Qo(e);
        if (E(ii, e)) return ii[e];
        var n = Xo(e);
        return ii[e] = n, ai[n] = e, n
      },
      keyFor: function(e) {
        if (!Co(e)) throw TypeError(e + " is not a symbol");
        if (E(ai, e)) return ai[e]
      },
      useSetter: function() {
        ri = !0
      },
      useSimple: function() {
        ri = !1
      }
    }), I({
      target: "Object",
      stat: !0,
      forced: !c,
      sham: !ko
    }, {
      create: function(e, n) {
        return void 0 === n ? To(e) : gi(To(e), n)
      },
      defineProperty: si,
      defineProperties: gi,
      getOwnPropertyDescriptor: r
    }), I({
      target: "Object",
      stat: !0,
      forced: !c
    }, {
      getOwnPropertyNames: j,
      getOwnPropertySymbols: hi
    }), I({
      target: "Object",
      stat: !0,
      forced: jo(function() {
        _o.f(1)
      })
    }, {
      getOwnPropertySymbols: function(e) {
        return _o.f(yo(e))
      }
    }), zo && I({
      target: "JSON",
      stat: !0,
      forced: !c || jo(function() {
        var e = Xo();
        return "[null]" != zo([e]) || "{}" != zo({
          a: e
        }) || "{}" != zo(Object(e))
      })
    }, {
      stringify: function(e, n, t) {
        for (var o, i = [e], a = 1; a < arguments.length;) i.push(arguments[a++]);
        if ((Eo(o = n) || void 0 !== e) && !Co(e)) return Io(n) || (n = function(e, n) {
          if ("function" == typeof o && (n = o.call(this, e, n)), !Co(n)) return n
        }), i[1] = n, zo.apply(null, i)
      }
    }), Xo[qo][Po] || xo(Xo[qo], Po, Xo[qo].valueOf), Go(Xo, Yo), Uo[Ho] = !0, (g = b)("asyncIterator"), (No = b)("hasInstance"), (Ro = b)("isConcatSpreadable"), (v = b)("iterator")
  }
  b("match"), b("matchAll"), b("replace"), b("search"), b("species"), b("split"), b("toPrimitive"), b("toStringTag"), b("unscopables"), Vt(t.JSON, "JSON", !0);

  function pi() {
    return this
  }

  function Ai(e, n, t) {
    return n += " Iterator", e.prototype = yi(vi, {
      next: Bi(1, t)
    }), wi(e, n, !1, !0), Qi[n] = pi, e
  }

  function di() {
    return this
  }

  function mi(e, n, t, o, i, a, r) {
    function c(e) {
      if (e === i && p) return p;
      if (!Mi && e in f) return f[e];
      switch (e) {
        case "keys":
        case Gi:
        case Ji:
          return function() {
            return new t(this, e)
          }
      }
      return function() {
        return new t(this)
      }
    }
    Ri(t, n, o);
    var l, s, o = n + " Iterator",
      g = !1,
      f = e.prototype,
      h = f[Fi] || f["@@iterator"] || i && f[i],
      p = !Mi && h || c(i),
      A = "Array" == n && f.entries || h;
    if (A && (A = xi(A.call(new e)), Li !== Object.prototype && A.next && (Ni(A, o, !0, !0), Oi[o] = di)), i == Gi && h && h.name !== Gi && (g = !0, p = function() {
      return h.call(this)
    }), r && f[Fi] !== p && Pi(f, Fi, p), Oi[n] = p, i)
      if (l = {
        values: c(Gi),
        keys: a ? p : c("keys"),
        entries: c(Ji)
      }, r)
        for (s in l) !Mi && !g && s in f || Ui(f, s, l[s]);
      else _i({
        target: n,
        proto: !0,
        forced: Mi || g
      }, l);
    return l
  }
  var ui, bi, C = ie.Symbol,
    l = {},
    s = !o(function() {
      function e() {}
      return e.prototype.constructor = null, Object.getPrototypeOf(new e) !== e.prototype
    }),
    ki = de,
    ji = me,
    Mo = s,
    Ii = m("IE_PROTO"),
    Ei = Object.prototype,
    y = Mo ? Object.getPrototypeOf : function(e) {
      return e = ji(e), ki(e, Ii) ? e[Ii] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? Ei : null
    },
    r = o,
    j = y,
    I = on,
    c = de,
    Ci = h("iterator"),
    jo = !1,
    Go = ([].keys && ("next" in (xo = [].keys()) ? (Po = j(j(xo))) !== Object.prototype && (ui = Po) : jo = !0), null == ui || r(function() {
      var e = {};
      return ui[Ci].call(e) !== e
    })),
    g = (Go && (ui = {}), Go && !c(ui, Ci) && I(ui, Ci, function() {
      return this
    }), {
      IteratorPrototype: ui,
      BUGGY_SAFARI_ITERATORS: jo
    }),
    vi = g.IteratorPrototype,
    yi = wt,
    Bi = K,
    wi = Vt,
    Qi = l,
    Si = a,
    Ti = tn,
    Di = function(e) {
      if (Si(e) || null === e) return e;
      throw TypeError("Can't set " + String(e) + " as a prototype")
    },
    No = Object.setPrototypeOf || ("__proto__" in {} ? function() {
      var t, o = !1,
        e = {};
      try {
        (t = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set).call(e, []), o = e instanceof Array
      } catch (e) {}
      return function(e, n) {
        return Ti(e), Di(n), o ? t.call(e, n) : e.__proto__ = n, e
      }
    }() : void 0),
    _i = f,
    Ri = Ai,
    xi = y,
    Ni = Vt,
    Pi = on,
    Ui = Gt,
    Ro = h,
    Oi = l,
    Li = g.IteratorPrototype,
    Mi = g.BUGGY_SAFARI_ITERATORS,
    Fi = Ro("iterator"),
    Gi = "values",
    Ji = "entries",
    Hi = oe,
    v = l,
    s = ro,
    m = mi,
    Yi = "Array Iterator",
    qi = s.set,
    Vi = s.getterFor(Yi),
    Mo = (m(Array, "Array", function(e, n) {
      qi(this, {
        type: Yi,
        target: Hi(e),
        index: 0,
        kind: n
      })
    }, function() {
      var e = Vi(this),
        n = e.target,
        t = e.kind,
        o = e.index++;
      return !n || o >= n.length ? {
        value: e.target = void 0,
        done: !0
      } : "keys" == t ? {
        value: o,
        done: !1
      } : "values" == t ? {
        value: n[o],
        done: !1
      } : {
        value: [o, n[o]],
        done: !1
      }
    }, "values"), v.Arguments = v.Array, {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0
    }),
    Wi = t,
    Ki = Kt,
    Xi = on,
    zi = l,
    Zi = h("toStringTag");
  for (bi in Mo) {
    var $i = Wi[bi],
      $i = $i && $i.prototype;
    $i && Ki($i) !== Zi && Xi($i, Zi, bi), zi[bi] = zi.Array
  }
  j = C;
  b("asyncDispose"), b("dispose"), b("matcher"), b("metadata"), b("observable"), b("patternMatch"), b("replaceAll");

  function ea(i) {
    return function(e, n) {
      var t, e = ta(oa(e)),
        n = na(n),
        o = e.length;
      return n < 0 || o <= n ? i ? "" : void 0 : (t = e.charCodeAt(n)) < 55296 || 56319 < t || n + 1 === o || (o = e.charCodeAt(n + 1)) < 56320 || 57343 < o ? i ? e.charAt(n) : t : i ? e.slice(n, n + 2) : o - 56320 + (t - 55296 << 10) + 65536
    }
  }
  var xo = j,
    na = Cn,
    ta = Wn,
    oa = ee,
    Po = {
      codeAt: ea(!1),
      charAt: ea(!0)
    },
    ia = Po.charAt,
    aa = Wn,
    r = ro,
    Go = mi,
    ra = "String Iterator",
    ca = r.set,
    la = r.getterFor(ra);
  Go(String, "String", function(e) {
    ca(this, {
      type: ra,
      string: aa(e),
      index: 0
    })
  }, function() {
    var e = la(this),
      n = e.string,
      t = e.index;
    return t >= n.length ? {
      value: void 0,
      done: !0
    } : (n = ia(n, t), e.index += n.length, {
      value: n,
      done: !1
    })
  });
  var sa, ga, fa, c = u.f("iterator");

  function ha(e) {
    return sa.exports = ha = "function" == typeof ga && "symbol" == typeof fa ? function(e) {
      return typeof e
    } : function(e) {
      return e && "function" == typeof ga && e.constructor === ga && e !== ga.prototype ? "symbol" : typeof e
    }, sa.exports.default = sa.exports, sa.exports.__esModule = !0, ha(e)
  }
  ga = xo, fa = c, (sa = n).exports = ha, sa.exports.default = sa.exports, sa.exports.__esModule = !0;

  function pa(e) {
    return void 0 !== e && (Ia.Array === e || Ca[Ea] === e)
  }

  function Aa(e) {
    if (null != e) return e[Ba] || e["@@iterator"] || ya[va(e)]
  }

  function da(e, n) {
    if ("function" != typeof(n = arguments.length < 2 ? Qa(e) : n)) throw TypeError(String(e) + " is not iterable");
    return wa(n.call(e))
  }

  function ma(e, n, t) {
    var o, i;
    Sa(e);
    try {
      if (void 0 === (o = e.return)) {
        if ("throw" === n) throw t;
        return t
      }
      o = o.call(e)
    } catch (e) {
      i = !0, o = e
    }
    if ("throw" === n) throw t;
    if (i) throw o;
    return Sa(o), t
  }

  function ua(e, n) {
    this.stopped = e, this.result = n
  }

  function ba(e, n, t) {
    function o(e) {
      return a && Pa(a, "normal", e), new ua(!0, e)
    }

    function i(e) {
      return h ? (Ta(e), A ? d(e[0], e[1], o) : d(e[0], e[1])) : A ? d(e, o) : d(e)
    }
    var a, r, c, l, s, g, f = t && t.that,
      h = !(!t || !t.AS_ENTRIES),
      p = !(!t || !t.IS_ITERATOR),
      A = !(!t || !t.INTERRUPTED),
      d = Ra(n, f, 1 + h + A);
    if (p) a = e;
    else {
      if ("function" != typeof(t = Na(e))) throw TypeError("Target is not iterable");
      if (Da(t)) {
        for (r = 0, c = _a(e.length); r < c; r++)
          if ((l = i(e[r])) && l instanceof ua) return l;
        return new ua(!1)
      }
      a = xa(e, t)
    }
    for (s = a.next; !(g = s.call(a)).done;) {
      try {
        l = i(g.value)
      } catch (e) {
        Pa(a, "throw", e)
      }
      if ("object" == typeof l && l && l instanceof ua) return l
    }
    return new ua(!1)
  }

  function ka(e, n) {
    var t = this;
    return t instanceof ka ? (Oa && (t = Oa(new Error(void 0), Ua(t))), void 0 !== n && La(t, "message", Fa(n)), Ma(e, (n = []).push, {
      that: n
    }), La(t, "errors", n), t) : new ka(e, n)
  }
  var ja = P(n.exports),
    I = {
      exports: {}
    },
    Ia = l,
    Ea = h("iterator"),
    Ca = Array.prototype,
    va = Kt,
    ya = l,
    Ba = h("iterator"),
    wa = tn,
    Qa = Aa,
    Sa = tn,
    Ta = tn,
    Da = pa,
    _a = Bn,
    Ra = $e,
    xa = da,
    Na = Aa,
    Pa = ma,
    jo = f,
    Ua = y,
    Oa = No,
    g = wt,
    La = on,
    Ro = K,
    Ma = ba,
    Fa = Wn;
  ka.prototype = g(Error.prototype, {
    constructor: Ro(5, ka),
    message: Ro(5, ""),
    name: Ro(5, "AggregateError")
  }), jo({
    global: !0
  }, {
    AggregateError: ka
  });

  function Ga(e, n, t) {
    for (var o in n) t && t.unsafe && e[o] ? e[o] = n[o] : Ya(e, o, n[o], t);
    return e
  }

  function Ja(e) {
    var e = qa(e),
      n = Va.f;
    Wa && e && !e[Ka] && n(e, Ka, {
      configurable: !0,
      get: function() {
        return this
      }
    })
  }

  function Ha(e, n, t) {
    if (e instanceof n) return e;
    throw TypeError("Incorrect " + (t ? t + " " : "") + "invocation")
  }
  var s = t.Promise,
    Ya = Gt,
    qa = le,
    Va = en,
    Wa = i,
    Ka = h("species"),
    Xa = h("iterator"),
    za = !1;
  try {
    var Za = 0,
      $a = {
        next: function() {
          return {
            done: !!Za++
          }
        },
        return: function() {
          za = !0
        }
      };
    $a[Xa] = function() {
      return this
    }, Array.from($a, function() {
      throw 2
    })
  } catch (e) {}

  function er(e, n) {
    if (!n && !za) return !1;
    var t = !1;
    try {
      var o = {};
      o[Xa] = function() {
        return {
          next: function() {
            return {
              done: t = !0
            }
          }
        }
      }, e(o)
    } catch (e) {}
    return t
  }

  function nr(e, n) {
    return void 0 === (e = ir(e).constructor) || null == (e = ir(e)[rr]) ? n : ar(e)
  }
  var tr, or, ir = tn,
    ar = ze,
    rr = h("species"),
    m = /(?:ipad|iphone|ipod).*applewebkit/i.test(se),
    v = "process" == V(t.process),
    cr = t,
    Mo = o,
    C = $e,
    lr = d,
    sr = p,
    b = m,
    j = v,
    r = cr.setImmediate,
    Go = cr.clearImmediate,
    gr = cr.process,
    u = cr.MessageChannel,
    fr = cr.Dispatch,
    hr = 0,
    pr = {},
    Ar = "onreadystatechange";
  try {
    tr = cr.location
  } catch (e) {}

  function dr(e) {
    return function() {
      _r(e)
    }
  }

  function mr(e) {
    _r(e.data)
  }

  function ur(e) {
    cr.postMessage(String(e), tr.protocol + "//" + tr.host)
  }

  function br(e) {
    var t, o;
    this.promise = new e(function(e, n) {
      if (void 0 !== t || void 0 !== o) throw TypeError("Bad Promise constructor");
      t = e, o = n
    }), this.resolve = Ur(t), this.reject = Ur(o)
  }

  function kr(e, n) {
    return Or(e), Lr(n) && n.constructor === e ? n : ((0, (e = Mr.f(e)).resolve)(n), e.promise)
  }

  function jr(e) {
    try {
      return {
        error: !1,
        value: e()
      }
    } catch (e) {
      return {
        error: !0,
        value: e
      }
    }
  }
  var Ir, Er, Cr, vr, yr, Br, wr, Qr, Sr, Tr, Dr, _r = function(e) {
      var n;
      pr.hasOwnProperty(e) && (n = pr[e], delete pr[e], n())
    },
    l = (r && Go || (r = function(e) {
      for (var n = [], t = arguments.length, o = 1; o < t;) n.push(arguments[o++]);
      return pr[++hr] = function() {
        ("function" == typeof e ? e : Function(e)).apply(void 0, n)
      }, or(hr), hr
    }, Go = function(e) {
      delete pr[e]
    }, j ? or = function(e) {
      gr.nextTick(dr(e))
    } : fr && fr.now ? or = function(e) {
      fr.now(dr(e))
    } : u && !b ? (n = (c = new u).port2, c.port1.onmessage = mr, or = C(n.postMessage, n, 1)) : cr.addEventListener && "function" == typeof postMessage && !cr.importScripts && tr && "file:" !== tr.protocol && !Mo(ur) ? (or = ur, cr.addEventListener("message", mr, !1)) : or = Ar in sr("script") ? function(e) {
      lr.appendChild(sr("script"))[Ar] = function() {
        lr.removeChild(this), _r(e)
      }
    } : function(e) {
      setTimeout(dr(e), 0)
    }), {
      set: r,
      clear: Go
    }),
    y = t,
    No = /ipad|iphone|ipod/i.test(se) && void 0 !== y.Pebble,
    g = /web0s(?!.*chrome)/i.test(se),
    Rr = t,
    Ro = e.f,
    xr = l.set,
    jo = m,
    $a = No,
    d = g,
    Nr = v,
    p = Rr.MutationObserver || Rr.WebKitMutationObserver,
    j = Rr.document,
    Pr = Rr.process,
    b = Rr.Promise,
    u = Ro(Rr, "queueMicrotask"),
    c = u && u.value,
    C = (c || (Ir = function() {
      var e, n;
      for (Nr && (e = Pr.domain) && e.exit(); Er;) {
        n = Er.fn, Er = Er.next;
        try {
          n()
        } catch (e) {
          throw Er ? vr() : Cr = void 0, e
        }
      }
      Cr = void 0, e && e.enter()
    }, vr = jo || Nr || d || !p || !j ? !$a && b && b.resolve ? ((wr = b.resolve(void 0)).constructor = b, Qr = wr.then, function() {
      Qr.call(wr, Ir)
    }) : Nr ? function() {
      Pr.nextTick(Ir)
    } : function() {
      xr.call(Rr, Ir)
    } : (yr = !0, Br = j.createTextNode(""), new p(Ir).observe(Br, {
      characterData: !0
    }), function() {
      Br.data = yr = !yr
    })), c || function(e) {
      e = {
        fn: e,
        next: void 0
      };
      Cr && (Cr.next = e), Er || (Er = e, vr()), Cr = e
    }),
    n = {},
    Ur = ze,
    Or = (n.f = function(e) {
      return new br(e)
    }, tn),
    Lr = a,
    Mr = n,
    Fr = t,
    Mo = "object" == typeof window,
    r = f,
    Gr = t,
    Go = le,
    y = s,
    e = Ga,
    m = Vt,
    No = Ja,
    Jr = a,
    Hr = ze,
    Yr = Ha,
    qr = k,
    Vr = ba,
    g = er,
    Wr = nr,
    Kr = l.set,
    Xr = C,
    zr = kr,
    Zr = function(e, n) {
      var t = Fr.console;
      t && t.error && (1 === arguments.length ? t.error(e) : t.error(e, n))
    },
    Ro = n,
    $r = jr,
    u = ro,
    jo = A,
    ec = Mo,
    nc = v,
    tc = ge,
    oc = h("species"),
    ic = "Promise",
    ac = u.get,
    rc = u.set,
    cc = u.getterFor(ic),
    d = y && y.prototype,
    lc = y,
    sc = d,
    gc = Gr.TypeError,
    fc = Gr.document,
    hc = Gr.process,
    pc = Ro.f,
    Ac = pc,
    dc = !!(fc && fc.createEvent && Gr.dispatchEvent),
    mc = "function" == typeof PromiseRejectionEvent,
    uc = "unhandledrejection",
    bc = "rejectionhandled",
    kc = 1,
    jc = 2,
    Ic = 1,
    Ec = 2,
    $a = jo(ic, function() {
      var e = qr(lc),
        n = e !== String(lc);
      if (!n && 66 === tc) return !0;
      if (!sc.finally) return !0;
      if (51 <= tc && /native code/.test(e)) return !1;

      function t(e) {
        e(function() {}, function() {})
      }
      e = new lc(function(e) {
        e(1)
      });
      return (e.constructor = {})[oc] = t, !(e.then(function() {}) instanceof t) || !n && ec && !mc
    }),
    b = $a || !g(function(e) {
      lc.all(e).catch(function() {})
    }),
    Cc = function(e) {
      var n;
      return !(!Jr(e) || "function" != typeof(n = e.then)) && n
    },
    vc = function(h, p) {
      var A;
      h.notified || (h.notified = !0, A = h.reactions, Xr(function() {
        for (var o, e = h.value, n = h.state == kc, t = 0; A.length > t;) {
          var i, a, r, c = A[t++],
            l = n ? c.ok : c.fail,
            s = c.resolve,
            g = c.reject,
            f = c.domain;
          try {
            l ? (n || (h.rejection === Ec && function(n) {
              Kr.call(Gr, function() {
                var e = n.facade;
                if (nc) hc.emit("rejectionHandled", e);
                else yc(bc, e, n.value)
              })
            }(h), h.rejection = Ic), !0 === l ? i = e : (f && f.enter(), i = l(e), f && (f.exit(), r = !0)), i === c.promise ? g(gc("Promise-chain cycle")) : (a = Cc(i)) ? a.call(i, s, g) : s(i)) : g(e)
          } catch (e) {
            f && !r && f.exit(), g(e)
          }
        }
        h.reactions = [], h.notified = !1, p && !h.rejection && (o = h, Kr.call(Gr, function() {
          var e = o.facade,
            n = o.value,
            t = Bc(o);
          if (t && (t = $r(function() {
            nc ? hc.emit("unhandledRejection", n, e) : yc(uc, e, n)
          }), o.rejection = nc || Bc(o) ? Ec : Ic, t.error)) throw t.value
        }))
      }))
    },
    yc = function(e, n, t) {
      var o;
      dc ? ((o = fc.createEvent("Event")).promise = n, o.reason = t, o.initEvent(e, !1, !0), Gr.dispatchEvent(o)) : o = {
        promise: n,
        reason: t
      }, !mc && (n = Gr["on" + e]) ? n(o) : e === uc && Zr("Unhandled promise rejection", t)
    },
    Bc = function(e) {
      return e.rejection !== Ic && !e.parent
    },
    wc = function(n, t, o) {
      return function(e) {
        n(t, e, o)
      }
    },
    Qc = function(e, n, t) {
      e.done || (e.done = !0, (e = t ? t : e).value = n, e.state = jc, vc(e, !0))
    },
    Sc = function(t, e, n) {
      if (!t.done) {
        t.done = !0, n && (t = n);
        try {
          if (t.facade === e) throw gc("Promise can't be resolved itself");
          var o = Cc(e);
          o ? Xr(function() {
            var n = {
              done: !1
            };
            try {
              o.call(e, wc(Sc, n, t), wc(Qc, n, t))
            } catch (e) {
              Qc(n, e, t)
            }
          }) : (t.value = e, t.state = kc, vc(t, !1))
        } catch (e) {
          Qc({
            done: !1
          }, e, t)
        }
      }
    };
  $a && (sc = (lc = function(e) {
    Yr(this, lc, ic), Hr(e), Sr.call(this);
    var n = ac(this);
    try {
      e(wc(Sc, n), wc(Qc, n))
    } catch (e) {
      Qc(n, e)
    }
  }).prototype, (Sr = function(e) {
    rc(this, {
      type: ic,
      done: !1,
      notified: !1,
      parent: !1,
      reactions: [],
      rejection: !1,
      state: 0,
      value: void 0
    })
  }).prototype = e(sc, {
    then: function(e, n) {
      var t = cc(this),
        o = pc(Wr(this, lc));
      return o.ok = "function" != typeof e || e, o.fail = "function" == typeof n && n, o.domain = nc ? hc.domain : void 0, t.parent = !0, t.reactions.push(o), 0 != t.state && vc(t, !1), o.promise
    },
    catch: function(e) {
      return this.then(void 0, e)
    }
  }), Tr = function() {
    var e = new Sr,
      n = ac(e);
    this.promise = e, this.resolve = wc(Sc, n), this.reject = wc(Qc, n)
  }, Ro.f = pc = function(e) {
    return e === lc || e === Dr ? new Tr : Ac(e)
  }), r({
    global: !0,
    wrap: !0,
    forced: $a
  }, {
    Promise: lc
  }), m(lc, ic, !1, !0), No(ic), Dr = Go(ic), r({
    target: ic,
    stat: !0,
    forced: $a
  }, {
    reject: function(e) {
      var n = pc(this);
      return n.reject.call(void 0, e), n.promise
    }
  }), r({
    target: ic,
    stat: !0,
    forced: !0
  }, {
    resolve: function(e) {
      return zr(this === Dr ? lc : this, e)
    }
  }), r({
    target: ic,
    stat: !0,
    forced: b
  }, {
    all: function(e) {
      var c = this,
        n = pc(c),
        l = n.resolve,
        s = n.reject,
        t = $r(function() {
          var o = Hr(c.resolve),
            i = [],
            a = 0,
            r = 1;
          Vr(e, function(e) {
            var n = a++,
              t = !1;
            i.push(void 0), r++, o.call(c, e).then(function(e) {
              t || (t = !0, i[n] = e, --r || l(i))
            }, s)
          }), --r || l(i)
        });
      return t.error && s(t.value), n.promise
    },
    race: function(e) {
      var t = this,
        o = pc(t),
        i = o.reject,
        n = $r(function() {
          var n = Hr(t.resolve);
          Vr(e, function(e) {
            n.call(t, e).then(o.resolve, i)
          })
        });
      return n.error && i(n.value), o.promise
    }
  });
  var Tc = ze,
    Dc = n,
    _c = jr,
    Rc = ba;
  f({
    target: "Promise",
    stat: !0
  }, {
    allSettled: function(e) {
      var c = this,
        n = Dc.f(c),
        l = n.resolve,
        t = n.reject,
        o = _c(function() {
          var o = Tc(c.resolve),
            i = [],
            a = 0,
            r = 1;
          Rc(e, function(e) {
            var n = a++,
              t = !1;
            i.push(void 0), r++, o.call(c, e).then(function(e) {
              t || (t = !0, i[n] = {
                status: "fulfilled",
                value: e
              }, --r || l(i))
            }, function(e) {
              t || (t = !0, i[n] = {
                status: "rejected",
                reason: e
              }, --r || l(i))
            })
          }), --r || l(i)
        });
      return o.error && t(o.value), n.promise
    }
  });
  var xc = ze,
    Nc = le,
    Pc = n,
    Uc = jr,
    Oc = ba,
    Lc = "No one promise resolved";
  f({
    target: "Promise",
    stat: !0
  }, {
    any: function(e) {
      var l = this,
        n = Pc.f(l),
        s = n.resolve,
        g = n.reject,
        t = Uc(function() {
          var o = xc(l.resolve),
            i = [],
            a = 0,
            r = 1,
            c = !1;
          Oc(e, function(e) {
            var n = a++,
              t = !1;
            i.push(void 0), r++, o.call(l, e).then(function(e) {
              t || c || (c = !0, s(e))
            }, function(e) {
              t || c || (t = !0, i[n] = e, --r || g(new(Nc("AggregateError"))(i, Lc)))
            })
          }), --r || g(new(Nc("AggregateError"))(i, Lc))
        });
      return t.error && g(t.value), n.promise
    }
  });
  var Mc = s,
    Fc = le,
    Gc = nr,
    Jc = kr;
  f({
    target: "Promise",
    proto: !0,
    real: !0,
    forced: !!Mc && o(function() {
      Mc.prototype.finally.call({
        then: function() {}
      }, function() {})
    })
  }, {
    finally: function(n) {
      var t = Gc(this, Fc("Promise")),
        e = "function" == typeof n;
      return this.then(e ? function(e) {
        return Jc(t, n()).then(function() {
          return e
        })
      } : n, e ? function(e) {
        return Jc(t, n()).then(function() {
          throw e
        })
      } : n)
    }
  });
  var Hc, j = ie.Promise,
    Yc = n,
    qc = jr;

  function Vc(e, n, t, o, i, a, r) {
    try {
      var c = e[a](r),
        l = c.value
    } catch (e) {
      return void t(e)
    }
    c.done ? n(l) : Hc.resolve(l).then(o, i)
  }
  f({
    target: "Promise",
    stat: !0
  }, {
    try: function(e) {
      var n = Yc.f(this),
        e = qc(e);
      return (e.error ? n.reject : n.resolve)(e.value), n.promise
    }
  }), Hc = j, (p = I).exports = function(c) {
    return function() {
      var e = this,
        r = arguments;
      return new Hc(function(n, t) {
        var o = c.apply(e, r);

        function i(e) {
          Vc(o, n, t, i, a, "next", e)
        }

        function a(e) {
          Vc(o, n, t, i, a, "throw", e)
        }
        i(void 0)
      })
    }
  }, p.exports.default = p.exports, p.exports.__esModule = !0;
  var Wc = P(I.exports),
    c = {
      exports: {}
    },
    Kc = ((k = c).exports = function(e, n) {
      if (!(e instanceof n)) throw new TypeError("Cannot call a class as a function")
    }, k.exports.default = k.exports, k.exports.__esModule = !0, P(c.exports)),
    l = {
      exports: {}
    },
    C = {
      exports: {}
    };
  f({
    target: "Object",
    stat: !0,
    forced: !i,
    sham: !i
  }, {
    defineProperty: en.f
  });
  var Xc, zc = ie.Object,
    A = C.exports = function(e, n, t) {
      return zc.defineProperty(e, n, t)
    },
    Mo = (zc.defineProperty.sham && (A.sham = !0), C.exports);

  function Zc(e, n) {
    for (var t = 0; t < n.length; t++) {
      var o = n[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Xc(e, o.key, o)
    }
  }
  Xc = Mo, (u = l).exports = function(e, n, t) {
    return n && Zc(e.prototype, n), t && Zc(e, t), e
  }, u.exports.default = u.exports, u.exports.__esModule = !0;

  function $c(e) {
    if (rl(e)) throw TypeError("The method doesn't accept regular expressions");
    return e
  }

  function el(n) {
    var t = /./;
    try {
      "/./" [n](t)
    } catch (e) {
      try {
        return t[cl] = !1, "/./" [n](t)
      } catch (e) {}
    }
    return !1
  }

  function nl(e) {
    return Al[e + "Prototype"]
  }
  var tl = P(l.exports),
    ol = a,
    il = V,
    al = h("match"),
    rl = function(e) {
      var n;
      return ol(e) && (void 0 !== (n = e[al]) ? !!n : "RegExp" == il(e))
    },
    cl = h("match"),
    y = f,
    ll = Bn,
    sl = Wn,
    gl = $c,
    fl = ee,
    d = el,
    hl = "".endsWith,
    pl = Math.min,
    Al = (y({
      target: "String",
      proto: !0,
      forced: !d("endsWith")
    }, {
      endsWith: function(e) {
        var n = sl(fl(this)),
          t = (gl(e), 1 < arguments.length ? arguments[1] : void 0),
          o = ll(n.length),
          t = void 0 === t ? o : pl(ll(t), o),
          o = sl(e);
        return hl ? hl.call(n, o, t) : n.slice(t - o.length, t) === o
      }
    }), ie),
    dl = nl("String").endsWith,
    ml = String.prototype,
    ul = function(e) {
      var n = e.endsWith;
      return "string" == typeof e || e === ml || e instanceof String && n === ml.endsWith ? dl : n
    },
    jo = f,
    bl = a,
    kl = jn,
    jl = Kn,
    Il = Bn,
    El = oe,
    Cl = Tn,
    g = h,
    e = Un("slice"),
    vl = g("species"),
    yl = [].slice,
    Bl = Math.max;
  jo({
    target: "Array",
    proto: !0,
    forced: !e
  }, {
    slice: function(e, n) {
      var t, o, i, a = El(this),
        r = Il(a.length),
        c = jl(e, r),
        l = jl(void 0 === n ? r : n, r);
      if (kl(a) && ((t = "function" == typeof(t = a.constructor) && (t === Array || kl(t.prototype)) || bl(t) && null === (t = t[vl]) ? void 0 : t) === Array || void 0 === t)) return yl.call(a, c, l);
      for (o = new(void 0 === t ? Array : t)(Bl(l - c, 0)), i = 0; c < l; c++, i++) c in a && Cl(o, i, a[c]);
      return o.length = i, o
    }
  });

  function wl(e) {
    var n = e.slice;
    return e === Sl || e instanceof Array && n === Sl.slice ? Ql : n
  }
  var Ql = nl("Array").slice,
    Sl = Array.prototype,
    Tl = wl,
    Ro = f,
    Dl = Mn.includes;
  Ro({
    target: "Array",
    proto: !0
  }, {
    includes: function(e) {
      return Dl(this, e, 1 < arguments.length ? arguments[1] : void 0)
    }
  });
  var m = nl("Array").includes,
    _l = $c,
    Rl = ee,
    xl = Wn;
  f({
    target: "String",
    proto: !0,
    forced: !el("includes")
  }, {
    includes: function(e) {
      return !!~xl(Rl(this)).indexOf(xl(_l(e)), 1 < arguments.length ? arguments[1] : void 0)
    }
  });
  var No = nl("String").includes,
    Nl = m,
    Pl = No,
    Ul = Array.prototype,
    Ol = String.prototype,
    Ll = function(e) {
      var n = e.includes;
      return e === Ul || e instanceof Array && n === Ul.includes ? Nl : "string" == typeof e || e === Ol || e instanceof String && n === Ol.includes ? Pl : n
    },
    Go = f,
    Ml = Bn,
    Fl = Wn,
    Gl = $c,
    Jl = ee,
    $a = el,
    Hl = "".startsWith,
    Yl = Math.min;
  Go({
    target: "String",
    proto: !0,
    forced: !$a("startsWith")
  }, {
    startsWith: function(e) {
      var n = Fl(Jl(this)),
        t = (Gl(e), Ml(Yl(1 < arguments.length ? arguments[1] : void 0, n.length))),
        e = Fl(e);
      return Hl ? Hl.call(n, e, t) : n.slice(t, t + e.length) === e
    }
  });

  function ql(e, n, t) {
    var o = t.charAt(n - 1),
      t = t.charAt(n + 1);
    return $l.test(e) && !es.test(t) || es.test(e) && !$l.test(o) ? "\\u" + e.charCodeAt(0).toString(16) : e
  }

  function Vl(i) {
    return function(e, n) {
      var t = 2 < arguments.length,
        o = t ? ts.call(arguments, 2) : void 0;
      return i(t ? function() {
        ("function" == typeof e ? e : Function(e)).apply(this, o)
      } : e, n)
    }
  }
  var Wl = nl("String").startsWith,
    Kl = String.prototype,
    Xl = function(e) {
      var n = e.startsWith;
      return "string" == typeof e || e === Kl || e instanceof String && n === Kl.startsWith ? Wl : n
    },
    r = f,
    b = o,
    zl = le("JSON", "stringify"),
    Zl = /[\uD800-\uDFFF]/g,
    $l = /^[\uD800-\uDBFF]$/,
    es = /^[\uDC00-\uDFFF]$/,
    s = b(function() {
      return '"\\udf06\\ud834"' !== zl("\udf06\ud834") || '"\\udead"' !== zl("\udead")
    }),
    ns = (zl && r({
      target: "JSON",
      stat: !0,
      forced: s
    }, {
      stringify: function(e, n, t) {
        var o = zl.apply(null, arguments);
        return "string" == typeof o ? o.replace(Zl, ql) : o
      }
    }), ie),
    B = (ns.JSON || (ns.JSON = {
      stringify: JSON.stringify
    }), function(e, n, t) {
      return ns.JSON.stringify.apply(null, arguments)
    }),
    n = f,
    p = t,
    ts = [].slice;
  n({
    global: !0,
    bind: !0,
    forced: /MSIE .\./.test(se)
  }, {
    setTimeout: Vl(p.setTimeout),
    setInterval: Vl(p.setInterval)
  });
  var os = ie.setTimeout,
    w = j,
    I = {
      exports: {}
    },
    k = function(r) {
      var l, e = Object.prototype,
        s = e.hasOwnProperty,
        n = "function" == typeof Symbol ? Symbol : {},
        o = n.iterator || "@@iterator",
        t = n.asyncIterator || "@@asyncIterator",
        i = n.toStringTag || "@@toStringTag";

      function a(e, n, t) {
        return Object.defineProperty(e, n, {
          value: t,
          enumerable: !0,
          configurable: !0,
          writable: !0
        }), e[n]
      }
      try {
        a({}, "")
      } catch (e) {
        a = function(e, n, t) {
          return e[n] = t
        }
      }

      function c(e, n, t, o) {
        var i, a, r, c, n = n && n.prototype instanceof m ? n : m,
          n = Object.create(n.prototype),
          o = new y(o || []);
        return n._invoke = (i = e, a = t, r = o, c = f, function(e, n) {
          if (c === p) throw new Error("Generator is already running");
          if (c === A) {
            if ("throw" === e) throw n;
            return w()
          }
          for (r.method = e, r.arg = n;;) {
            var t = r.delegate;
            if (t) {
              t = function e(n, t) {
                var o = n.iterator[t.method];
                if (o === l) {
                  if (t.delegate = null, "throw" === t.method) {
                    if (n.iterator.return && (t.method = "return", t.arg = l, e(n, t), "throw" === t.method)) return d;
                    t.method = "throw", t.arg = new TypeError("The iterator does not provide a 'throw' method")
                  }
                  return d
                }
                o = g(o, n.iterator, t.arg);
                if ("throw" === o.type) return t.method = "throw", t.arg = o.arg, t.delegate = null, d;
                o = o.arg;
                if (!o) return t.method = "throw", t.arg = new TypeError("iterator result is not an object"), t.delegate = null, d; {
                  if (!o.done) return o;
                  t[n.resultName] = o.value, t.next = n.nextLoc, "return" !== t.method && (t.method = "next", t.arg = l)
                }
                t.delegate = null;
                return d
              }(t, r);
              if (t) {
                if (t === d) continue;
                return t
              }
            }
            if ("next" === r.method) r.sent = r._sent = r.arg;
            else if ("throw" === r.method) {
              if (c === f) throw c = A, r.arg;
              r.dispatchException(r.arg)
            } else "return" === r.method && r.abrupt("return", r.arg);
            c = p;
            t = g(i, a, r);
            if ("normal" === t.type) {
              if (c = r.done ? A : h, t.arg !== d) return {
                value: t.arg,
                done: r.done
              }
            } else "throw" === t.type && (c = A, r.method = "throw", r.arg = t.arg)
          }
        }), n
      }

      function g(e, n, t) {
        try {
          return {
            type: "normal",
            arg: e.call(n, t)
          }
        } catch (e) {
          return {
            type: "throw",
            arg: e
          }
        }
      }
      r.wrap = c;
      var f = "suspendedStart",
        h = "suspendedYield",
        p = "executing",
        A = "completed",
        d = {};

      function m() {}

      function u() {}

      function b() {}
      var n = {},
        k = (a(n, o, function() {
          return this
        }), Object.getPrototypeOf),
        k = k && k(k(B([]))),
        j = (k && k !== e && s.call(k, o) && (n = k), b.prototype = m.prototype = Object.create(n));

      function I(e) {
        ["next", "throw", "return"].forEach(function(n) {
          a(e, n, function(e) {
            return this._invoke(n, e)
          })
        })
      }

      function E(r, c) {
        var n;
        this._invoke = function(t, o) {
          function e() {
            return new c(function(e, n) {
              ! function n(e, t, o, i) {
                var a, e = g(r[e], r, t);
                if ("throw" !== e.type) return (t = (a = e.arg).value) && "object" == typeof t && s.call(t, "__await") ? c.resolve(t.__await).then(function(e) {
                  n("next", e, o, i)
                }, function(e) {
                  n("throw", e, o, i)
                }) : c.resolve(t).then(function(e) {
                  a.value = e, o(a)
                }, function(e) {
                  return n("throw", e, o, i)
                });
                i(e.arg)
              }(t, o, e, n)
            })
          }
          return n = n ? n.then(e, e) : e()
        }
      }

      function C(e) {
        var n = {
          tryLoc: e[0]
        };
        1 in e && (n.catchLoc = e[1]), 2 in e && (n.finallyLoc = e[2], n.afterLoc = e[3]), this.tryEntries.push(n)
      }

      function v(e) {
        var n = e.completion || {};
        n.type = "normal", delete n.arg, e.completion = n
      }

      function y(e) {
        this.tryEntries = [{
          tryLoc: "root"
        }], e.forEach(C, this), this.reset(!0)
      }

      function B(n) {
        if (n) {
          var t, e = n[o];
          if (e) return e.call(n);
          if ("function" == typeof n.next) return n;
          if (!isNaN(n.length)) return t = -1, (e = function e() {
            for (; ++t < n.length;)
              if (s.call(n, t)) return e.value = n[t], e.done = !1, e;
            return e.value = l, e.done = !0, e
          }).next = e
        }
        return {
          next: w
        }
      }

      function w() {
        return {
          value: l,
          done: !0
        }
      }
      return a(j, "constructor", u.prototype = b), a(b, "constructor", u), u.displayName = a(b, i, "GeneratorFunction"), r.isGeneratorFunction = function(e) {
        e = "function" == typeof e && e.constructor;
        return !!e && (e === u || "GeneratorFunction" === (e.displayName || e.name))
      }, r.mark = function(e) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, a(e, i, "GeneratorFunction")), e.prototype = Object.create(j), e
      }, r.awrap = function(e) {
        return {
          __await: e
        }
      }, I(E.prototype), a(E.prototype, t, function() {
        return this
      }), r.AsyncIterator = E, r.async = function(e, n, t, o, i) {
        void 0 === i && (i = Promise);
        var a = new E(c(e, n, t, o), i);
        return r.isGeneratorFunction(n) ? a : a.next().then(function(e) {
          return e.done ? e.value : a.next()
        })
      }, I(j), a(j, i, "Generator"), a(j, o, function() {
        return this
      }), a(j, "toString", function() {
        return "[object Generator]"
      }), r.keys = function(t) {
        var e, o = [];
        for (e in t) o.push(e);
        return o.reverse(),
          function e() {
            for (; o.length;) {
              var n = o.pop();
              if (n in t) return e.value = n, e.done = !1, e
            }
            return e.done = !0, e
          }
      }, r.values = B, y.prototype = {
        constructor: y,
        reset: function(e) {
          if (this.prev = 0, this.next = 0, this.sent = this._sent = l, this.done = !1, this.delegate = null, this.method = "next", this.arg = l, this.tryEntries.forEach(v), !e)
            for (var n in this) "t" === n.charAt(0) && s.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = l)
        },
        stop: function() {
          this.done = !0;
          var e = this.tryEntries[0].completion;
          if ("throw" === e.type) throw e.arg;
          return this.rval
        },
        dispatchException: function(t) {
          if (this.done) throw t;
          var o = this;

          function e(e, n) {
            return a.type = "throw", a.arg = t, o.next = e, n && (o.method = "next", o.arg = l), !!n
          }
          for (var n = this.tryEntries.length - 1; 0 <= n; --n) {
            var i = this.tryEntries[n],
              a = i.completion;
            if ("root" === i.tryLoc) return e("end");
            if (i.tryLoc <= this.prev) {
              var r = s.call(i, "catchLoc"),
                c = s.call(i, "finallyLoc");
              if (r && c) {
                if (this.prev < i.catchLoc) return e(i.catchLoc, !0);
                if (this.prev < i.finallyLoc) return e(i.finallyLoc)
              } else if (r) {
                if (this.prev < i.catchLoc) return e(i.catchLoc, !0)
              } else {
                if (!c) throw new Error("try statement without catch or finally");
                if (this.prev < i.finallyLoc) return e(i.finallyLoc)
              }
            }
          }
        },
        abrupt: function(e, n) {
          for (var t = this.tryEntries.length - 1; 0 <= t; --t) {
            var o = this.tryEntries[t];
            if (o.tryLoc <= this.prev && s.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
              var i = o;
              break
            }
          }
          var a = (i = i && ("break" === e || "continue" === e) && i.tryLoc <= n && n <= i.finallyLoc ? null : i) ? i.completion : {};
          return a.type = e, a.arg = n, i ? (this.method = "next", this.next = i.finallyLoc, d) : this.complete(a)
        },
        complete: function(e, n) {
          if ("throw" === e.type) throw e.arg;
          return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && n && (this.next = n), d
        },
        finish: function(e) {
          for (var n = this.tryEntries.length - 1; 0 <= n; --n) {
            var t = this.tryEntries[n];
            if (t.finallyLoc === e) return this.complete(t.completion, t.afterLoc), v(t), d
          }
        },
        catch: function(e) {
          for (var n = this.tryEntries.length - 1; 0 <= n; --n) {
            var t, o, i = this.tryEntries[n];
            if (i.tryLoc === e) return "throw" === (t = i.completion).type && (o = t.arg, v(i)), o
          }
          throw new Error("illegal catch attempt")
        },
        delegateYield: function(e, n, t) {
          return this.delegate = {
            iterator: B(e),
            resultName: n,
            nextLoc: t
          }, "next" === this.method && (this.arg = l), d
        }
      }, r
    }(I.exports);
  try {
    regeneratorRuntime = k
  } catch (e) {
    "object" == typeof globalThis ? globalThis.regeneratorRuntime = k : Function("r", "regeneratorRuntime = r")(k)
  }
  var is = I.exports,
    as = me,
    rs = At;
  f({
    target: "Object",
    stat: !0,
    forced: o(function() {
      rs(1)
    })
  }, {
    keys: function(e) {
      return rs(as(e))
    }
  });
  var cs = ie.Object.keys,
    ls = nl("Array").concat,
    ss = Array.prototype,
    gs = function(e) {
      var n = e.concat;
      return e === ss || e instanceof Array && n === ss.concat ? ls : n
    },
    c = f,
    fs = co.map;
  c({
    target: "Array",
    proto: !0,
    forced: !Un("map")
  }, {
    map: function(e) {
      return fs(this, e, 1 < arguments.length ? arguments[1] : void 0)
    }
  });

  function hs(e, n) {
    var t = [][e];
    return !!t && bs(function() {
      t.call(null, n || function() {
        throw 1
      }, 1)
    })
  }
  var ps, Q, As = nl("Array").map,
    ds = Array.prototype,
    ms = function(e) {
      var n = e.map;
      return e === ds || e instanceof Array && n === ds.map ? As : n
    },
    S = {
      VERSION: "7.4",
      POST_DATA_FREEZING_PERIOD: 6e4,
      WASM_INITIAL_TIMEOUT: 2e3,
      INIT_TOKEN_TIMEOUT: 6e4,
      URL_IFRAME: "/dedge/zd/zd-service.html",
      initTokenStartTime: 0,
      nativeCallbackIndex: 0,
      tempDVID: "",
      tempDVToken: "",
      tempDVMA: "",
      tempDVUUID: "",
      tempDVCJ: "",
      dvLastPostTime: 0,
      dvLastDecryptErrCode: 0,
      dvWaitingResponse: !1,
      initTokenTimeoutReason: ""
    },
    us = ((A = ps = ps || {}).syncCollecting = "syncCollecting", A.asyncCollecting = "asyncCollecting", A.collectionDone = "collectionDone", A.encrypting = "encrypting", A.reporting = "reporting", A.decrypting = "decrypting", {
      POST_DATA: {
        url: "/raphael_data_v5",
        method: "POST"
      },
      SECOND_REQUEST: {
        url: "/raphael_data_v5",
        method: "PUT"
      },
      MANUAL_POST_DATA: {
        url: "/raphael_event",
        method: "POST"
      },
      SIMPLE_REQUEST: {
        url: "/ping",
        method: "GET"
      }
    }),
    bs = ((C = Q = Q || {}).VALUE_LONG = "value is too long", C.SUCCESS = "success", C.PARA_ERR = "para_err", C.EMPTY = "empty", C.DEFAULT = "default", C.NO_PERMISSON = "no_permission", C.EXCEPTION = "exception", C.NOT_SUPPORT = "not_supported", C.CONNECTION_FAILED = "connection_failed", C.CONNECTING = "connecting", C.TIMEOUT = "time_out", C.WS_TIMEOUT = "ws_timeout", C.RUNNING = "running", o),
    Mo = f,
    ks = Mn.indexOf,
    u = hs,
    js = [].indexOf,
    Is = !!js && 1 / [1].indexOf(1, -0) < 0,
    V = u("indexOf");
  Mo({
    target: "Array",
    proto: !0,
    forced: Is || !V
  }, {
    indexOf: function(e) {
      return Is ? js.apply(this, arguments) || 0 : ks(this, e, 1 < arguments.length ? arguments[1] : void 0)
    }
  });
  var Es, T, Cs, vs = nl("Array").indexOf,
    ys = Array.prototype,
    D = function(e) {
      var n = e.indexOf;
      return e === ys || e instanceof Array && n === ys.indexOf ? vs : n
    },
    Bs = ((y = Es = Es || {}).sqljs_failed_to_start = "Sqljs failed to start", y.zangodb_failed_to_start = "Zangodb failed to start", y.support_only_select_grammar = "Support only select grammar", y.failed_to_parse_sql_code = "Failed to parse sql code", y.failed_to_exec_sql = "Failed to execute sqlcode", y.script_not_exists = "Script not exists", y.failed_to_delete_in_sqljs = "Failed to delete in sqljs", y.failed_to_delete_in_zangodb = "Failed to delete in zangodb", y.invalid_response_from_worker = "Invalid response from worker", y.parameter_error = "Parameter error", y.unknown_error = "Unknown error", y.worker_failed_to_start = "Worker failed to start", y.failed_to_hot_update_script = "Failed to hot update script", y.failed_to_update_dv_field = "Failed to update dv field", y.zangodb_execution_error = "zangodb execution error", y.zangodb_failed_to_handle_result = "zangodb failed to handle result", y.failed_to_parse_data_before_send = "Failed to parse data before send", y.website_is_in_backend = "Website is in backend", y.failed_to_create_worker = "Failed to create worker", y.failed_to_create_db_for_sqljs = "Failed to create db for sqljs", y.failed_to_get_worker_file_for_sqljs = "Failed to get worker file", y.xdr_failed_to_send_request = "xdr failed to send request", y.xhr_not_supported = "xhr not supported", y.xhr_failed_to_open_url = "xhr failed to open url", y.xhr_status_not_200 = "xhr status not 200", y.no_dvid_in_response = "no dvid in response", Q.CONNECTION_FAILED + ": " + Es.xhr_status_not_200 + ": "),
    _ = ((d = T = T || {}).DVID = "DVID", d.DVToken = "DVToken", d.DVUUID = "DVUUID", d.DVMA = "DVMA", d.DVLastPostTime = "DVLastPostTime", d.DVDecryptErrCode = "DVDecryptErrCode", d.DVLastPutSpendTime = "DVLastPutSpendTime", d.DVFONTCOUNT = "DVFONTCOUNT", d.DVFONTRESULT = "DVFONTRESULT", d.DVJ34 = "DVJ34", d.DVJ35 = "DVJ35", d.DVJ75 = "DVJ75", d.DVJ85 = "DVJ85", d.DVLowPerformance = "DVLowPerformance", d.DVZDconfig = "DVZDconfig", {
      getFromLocalStorage: function(e) {
        try {
          return localStorage.getItem(e)
        } catch (e) {
          return ""
        }
      },
      setLocalStorage: function(e, n) {
        try {
          localStorage.setItem(e, n)
        } catch (e) {}
      },
      removeFromLocalStorage: function(e) {
        try {
          localStorage.removeItem(e)
        } catch (e) {}
      },
      now: function() {
        return (new Date).getTime()
      },
      isArray: function(e) {
        return Array.isArray ? Array.isArray(e) : "[object Array]" === Object.prototype.toString.call(e)
      },
      waituntil: function(o) {
        var i = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 20,
          a = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 3e3,
          r = _.now();
        return new w(function(n, t) {
          ! function e() {
            if (_.now() - r > a) return t(Q.TIMEOUT);
            o() ? n() : os(e, i)
          }()
        })
      },
      sleep: function(n) {
        return new w(function(e) {
          return os(e, n)
        })
      },
      createXmlHttp: function() {
        var e = null;
        try {
          e = new XMLHttpRequest
        } catch (e) {
          return null
        }
        return e
      },
      createXDomainRequest: function() {
        var e = null;
        try {
          e = new window.XDomainRequest
        } catch (e) {
          return null
        }
        return e
      },
      ajax: function(e, a, r, c, l) {
        return new w(function(t, o) {
          var n = _.createXDomainRequest();
          if (n) try {
            n.open(e, a, !0), n.send(r), n.onload = function() {
              var e = "";
              try {
                e = n.responseText || ""
              } catch (e) {}
              t(c ? {
                response: e,
                headers: {}
              } : e)
            }
          } catch (e) {
            o(Es.xdr_failed_to_send_request)
          } else {
            var i = _.createXmlHttp();
            if (!i) return console.error("The version of browser is too old to support raphael"), void o(Q.CONNECTION_FAILED + ": " + Es.xhr_not_supported);
            try {
              i.open(e, a, !0)
            } catch (e) {
              return void o(Q.CONNECTION_FAILED + ": " + Es.xhr_failed_to_open_url)
            }
            i.setRequestHeader && "function" == typeof i.setRequestHeader && (i.setRequestHeader("Content-Type", "application/json"), i.setRequestHeader("Accept", "application/json"), l && cs(l).forEach(function(e) {
              var n = l[e];
              i.setRequestHeader(e, n)
            })), i.send(r), i.onreadystatechange = function() {
              var n, e;
              4 == i.readyState && (200 != i.status ? o(Bs + B({
                status: i.status,
                headers: "function" == typeof i.getAllResponseHeaders ? i.getAllResponseHeaders() : Q.NOT_SUPPORT,
                body: i.response
              })) : c ? (n = {}, (e = i.getAllResponseHeaders()) && e.split("\r\n").forEach(function(e) {
                Ll(e).call(e, ": ") && (e = e.split(": "), n[e[0]] = e[1])
              }), t({
                response: i.response,
                headers: n
              })) : t(i.response))
            }
          }
        })
      },
      on: function(n, e, t, o) {
        o = !!o, n.addEventListener ? n.addEventListener(e, t, o) : n.attachEvent("on" + e, function(e) {
          return t.call(n, e)
        }, o)
      },
      getRndInteger: function(e, n) {
        return Math.floor(Math.random() * (n - e)) + e
      },
      clearTimeout: (Cs = function(e) {
        try {
          clearTimeout(e)
        } catch (e) {}
      }, ws.toString = function() {
        return Cs.toString()
      }, ws),
      MD5: function(e) {
        function c(e, n) {
          var t = 2147483648 & e,
            o = 2147483648 & n,
            i = 1073741824 & e,
            a = 1073741824 & n,
            e = (1073741823 & e) + (1073741823 & n);
          return i & a ? 2147483648 ^ e ^ t ^ o : i | a ? 1073741824 & e ? 3221225472 ^ e ^ t ^ o : 1073741824 ^ e ^ t ^ o : e ^ t ^ o
        }

        function n(e, n, t, o, i, a, r) {
          return e = c(e, c(c(n & t | ~n & o, i), r)), c(e << a | e >>> 32 - a, n)
        }

        function t(e, n, t, o, i, a, r) {
          return e = c(e, c(c(n & o | t & ~o, i), r)), c(e << a | e >>> 32 - a, n)
        }

        function o(e, n, t, o, i, a, r) {
          return e = c(e, c(c(n ^ t ^ o, i), r)), c(e << a | e >>> 32 - a, n)
        }

        function i(e, n, t, o, i, a, r) {
          return e = c(e, c(c(t ^ (n | ~o), i), r)), c(e << a | e >>> 32 - a, n)
        }

        function a(e) {
          for (var n = "", t = "", o = 0; o <= 3; o++) n += (t = "0" + (t = e >>> 8 * o & 255).toString(16)).substr(t.length - 2, 2);
          return n
        }
        var r, l, s, g, f = function(e) {
            for (var n, t = e.length, o = t + 8, i = 16 * ((o - o % 64) / 64 + 1), a = Array(i - 1), r = 0; r < t;) n = r % 4 * 8, a[o = (r - r % 4) / 4] |= e.charCodeAt(r) << n, r++;
            return a[o = (r - r % 4) / 4] |= 128 << r % 4 * 8, a[i - 2] = t << 3, a[i - 1] = t >>> 29, a
          }(e = function(e) {
            e = e.replace(/\r\n/g, "\n");
            for (var n = "", t = 0; t < e.length; t++) {
              var o = e.charCodeAt(t);
              o < 128 ? n += String.fromCharCode(o) : (127 < o && o < 2048 ? n += String.fromCharCode(o >> 6 | 192) : n = (n += String.fromCharCode(o >> 12 | 224)) + String.fromCharCode(o >> 6 & 63 | 128), n += String.fromCharCode(63 & o | 128))
            }
            return n
          }(e)),
          h = 1732584193,
          p = 4023233417,
          A = 2562383102,
          d = 271733878;
        for (e = 0; e < f.length; e += 16) h = n(r = h, l = p, s = A, g = d, f[e + 0], 7, 3614090360), d = n(d, h, p, A, f[e + 1], 12, 3905402710), A = n(A, d, h, p, f[e + 2], 17, 606105819), p = n(p, A, d, h, f[e + 3], 22, 3250441966), h = n(h, p, A, d, f[e + 4], 7, 4118548399), d = n(d, h, p, A, f[e + 5], 12, 1200080426), A = n(A, d, h, p, f[e + 6], 17, 2821735955), p = n(p, A, d, h, f[e + 7], 22, 4249261313), h = n(h, p, A, d, f[e + 8], 7, 1770035416), d = n(d, h, p, A, f[e + 9], 12, 2336552879), A = n(A, d, h, p, f[e + 10], 17, 4294925233), p = n(p, A, d, h, f[e + 11], 22, 2304563134), h = n(h, p, A, d, f[e + 12], 7, 1804603682), d = n(d, h, p, A, f[e + 13], 12, 4254626195), A = n(A, d, h, p, f[e + 14], 17, 2792965006), h = t(h, p = n(p, A, d, h, f[e + 15], 22, 1236535329), A, d, f[e + 1], 5, 4129170786), d = t(d, h, p, A, f[e + 6], 9, 3225465664), A = t(A, d, h, p, f[e + 11], 14, 643717713), p = t(p, A, d, h, f[e + 0], 20, 3921069994), h = t(h, p, A, d, f[e + 5], 5, 3593408605), d = t(d, h, p, A, f[e + 10], 9, 38016083), A = t(A, d, h, p, f[e + 15], 14, 3634488961), p = t(p, A, d, h, f[e + 4], 20, 3889429448), h = t(h, p, A, d, f[e + 9], 5, 568446438), d = t(d, h, p, A, f[e + 14], 9, 3275163606), A = t(A, d, h, p, f[e + 3], 14, 4107603335), p = t(p, A, d, h, f[e + 8], 20, 1163531501), h = t(h, p, A, d, f[e + 13], 5, 2850285829), d = t(d, h, p, A, f[e + 2], 9, 4243563512), A = t(A, d, h, p, f[e + 7], 14, 1735328473), h = o(h, p = t(p, A, d, h, f[e + 12], 20, 2368359562), A, d, f[e + 5], 4, 4294588738), d = o(d, h, p, A, f[e + 8], 11, 2272392833), A = o(A, d, h, p, f[e + 11], 16, 1839030562), p = o(p, A, d, h, f[e + 14], 23, 4259657740), h = o(h, p, A, d, f[e + 1], 4, 2763975236), d = o(d, h, p, A, f[e + 4], 11, 1272893353), A = o(A, d, h, p, f[e + 7], 16, 4139469664), p = o(p, A, d, h, f[e + 10], 23, 3200236656), h = o(h, p, A, d, f[e + 13], 4, 681279174), d = o(d, h, p, A, f[e + 0], 11, 3936430074), A = o(A, d, h, p, f[e + 3], 16, 3572445317), p = o(p, A, d, h, f[e + 6], 23, 76029189), h = o(h, p, A, d, f[e + 9], 4, 3654602809), d = o(d, h, p, A, f[e + 12], 11, 3873151461), A = o(A, d, h, p, f[e + 15], 16, 530742520), h = i(h, p = o(p, A, d, h, f[e + 2], 23, 3299628645), A, d, f[e + 0], 6, 4096336452), d = i(d, h, p, A, f[e + 7], 10, 1126891415), A = i(A, d, h, p, f[e + 14], 15, 2878612391), p = i(p, A, d, h, f[e + 5], 21, 4237533241), h = i(h, p, A, d, f[e + 12], 6, 1700485571), d = i(d, h, p, A, f[e + 3], 10, 2399980690), A = i(A, d, h, p, f[e + 10], 15, 4293915773), p = i(p, A, d, h, f[e + 1], 21, 2240044497), h = i(h, p, A, d, f[e + 8], 6, 1873313359), d = i(d, h, p, A, f[e + 15], 10, 4264355552), A = i(A, d, h, p, f[e + 6], 15, 2734768916), p = i(p, A, d, h, f[e + 13], 21, 1309151649), h = i(h, p, A, d, f[e + 4], 6, 4149444226), d = i(d, h, p, A, f[e + 11], 10, 3174756917), A = i(A, d, h, p, f[e + 2], 15, 718787259), p = i(p, A, d, h, f[e + 9], 21, 3951481745), h = c(h, r), p = c(p, l), A = c(A, s), d = c(d, g);
        return (a(h) + a(p) + a(A) + a(d)).toLowerCase()
      },
      transformCdnDomain: function(e) {
        var e = e.split("."),
          n = e[e.length - 1],
          e = e[e.length - 2];
        return "gw-dv" === e ? "https://ls.cdn-gw-dv.vip" : gs(e = "https://ls.cdn-".concat(e, ".")).call(e, n)
      },
      generateDomain: function(e, n) {
        var t = [e],
          e = e.split(".");
        if (e.length < 2) return t;
        var o, i = e[e.length - 1],
          a = e[e.length - 2],
          r = null;
        return Ll(i).call(i, ":") && (i = (o = i.split(":"))[0], r = parseInt(o[o.length - 1])), "gw-dv" === a ? (n && t.push(gs(o = Tl(e).call(e, 0, e.length - 2)).call(o, ["cdn-gw-dv", "vip"]).join(".")), "vip" !== i && t.push(gs(o = Tl(e).call(e, 0, e.length - 1)).call(o, "vip").join(".")), "io" !== i && t.push(gs(o = Tl(e).call(e, 0, e.length - 1)).call(o, "io").join(".")), "xyz" !== i && t.push(gs(o = Tl(e).call(e, 0, e.length - 1)).call(o, "xyz").join("."))) : n && (e[e.length - 2] = "cdn-".concat(a), t.push(e.join("."))), r ? ms(t).call(t, function(e) {
          return Ll(e).call(e, ":") ? e : gs(e = "".concat(e, ":")).call(e, r)
        }) : t
      },
      isCdnDomain: function(e) {
        e = e.split(".");
        if (e.length < 2) return !1;
        e = e[e.length - 2];
        return !!Xl(e).call(e, "cdn-")
      }
    });

  function ws(e) {
    return Cs.apply(this, arguments)
  }

  function Qs() {
    return S.tempDVToken || _.getFromLocalStorage(T.DVToken) || Q.EMPTY
  }

  function Ss() {
    var e = "";
    return S.tempDVUUID ? e = S.tempDVUUID : _.getFromLocalStorage(T.DVUUID) ? (e = _.getFromLocalStorage(T.DVUUID), S.tempDVUUID = e) : (e = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
      var n = 16 * Math.random() | 0;
      return ("x" == e ? n : 3 & n | 8).toString(16)
    }), S.tempDVUUID = e, _.setLocalStorage(T.DVUUID, e)), e || Q.EMPTY
  }

  function Ts() {
    return S.tempDVID || _.getFromLocalStorage(T.DVID) || Q.EMPTY
  }
  var Ds = function() {
    function e() {
      Kc(this, e), this.domainIndexOfLastSuccessRequest = 0, this.env = "", this.ack = ""
    }
    var o;
    return tl(e, [{
      key: "getLastPostTime",
      value: function() {
        var e;
        return S.dvLastPostTime && "number" == typeof S.dvLastPostTime ? S.dvLastPostTime : (e = parseInt(_.getFromLocalStorage(T.DVLastPostTime)), isNaN(e) ? 0 : e)
      }
    }, {
      key: "setLastPostTime",
      value: function(e) {
        S.dvLastPostTime = e, _.setLocalStorage(T.DVLastPostTime, e + "")
      }
    }, {
      key: "getEnv",
      value: function() {
        return this.env
      }
    }, {
      key: "getAck",
      value: function() {
        return this.ack
      }
    }, {
      key: "setEnv",
      value: function(e) {
        this.env = e
      }
    }, {
      key: "setAck",
      value: function(e) {
        this.ack = e
      }
    }, {
      key: "reportData",
      value: function(a, r) {
        var c = this;
        return new w(function(t, o) {
          i = {}, cs(n = a).forEach(function(e) {
            switch (ja(n[e])) {
              case "boolean":
                i[e] = n[e] ? "true" : "false";
                break;
              case "object":
                i[e] = B(n[e]);
                break;
              case "number":
                i[e] = n[e] + "";
                break;
              case "string":
                "" !== n[e] && (i[e] = n[e]);
                break;
              default:
                i[e] = n[e]
            }
          });
          var n, i, e = i;
          c._transformBeforeSend(r, e).then(function(e) {
            return c.reportByHttp(e)
          }).then(function(e) {
            return c._transformAfterRecive(r, e.responseStr, e.encrypted)
          }).then(function(e) {
            var n;
            S.dvWaitingResponse = !1, e.DVID ? (n = 0, e.DVMA && (n = e.DVMA < 0 ? 0 : Math.min(Math.max(1 / 24 / 6, e.DVMA), 10)), S.tempDVMA = n + "", S.tempDVID = e.DVID || "", S.tempDVToken = e.DVToken || "", c.sendSecondRequest(S.tempDVID, S.tempDVToken, a.u1, e.UT || "", _.now() - S.initTokenStartTime), _.setLocalStorage(T.DVMA, _.now() + 864e5 * n + ""), _.setLocalStorage(T.DVToken, S.tempDVToken), _.setLocalStorage(T.DVID, S.tempDVID), t(S.tempDVToken)) : o(Q.EXCEPTION + ": " + Es.no_dvid_in_response)
          }).catch(function(e) {
            if ("string" == typeof e && Xl(e).call(e, Q.CONNECTION_FAILED)) o(e);
            else {
              var n, t = "";
              try {
                e && e.message && "string" == typeof e.message ? t = e.message : "string" == typeof e ? t = e : "object" == ja(e) ? t = B(e) : e && "function" == typeof e.toString && "string" == typeof e.toString() && (t = e.toString())
              } catch (e) {}
              o(t ? gs(n = "".concat(Q.EXCEPTION, ": ")).call(n, t) : Q.EXCEPTION)
            }
          })
        })
      }
    }, {
      key: "reportByHttp",
      value: function(i) {
        var a = this;
        return S.initTokenTimeoutReason = ps.reporting, new w(function(t, n) {
          var o = _.now(),
            e = "{" !== i[0];
          a.reportByOriginOrCdn("POST", i, e ? {
            c: "1"
          } : {}).then(function(e) {
            var n;
            a.postDataSpendTime = _.now() - o;
            try {
              n = "1" == e.headers.cv
            } catch (e) {
              n = !1
            }
            t({
              responseStr: e.response,
              encrypted: n
            })
          }).catch(function(e) {
            return n(e)
          }), a.setLastPostTime(_.now())
        })
      }
    }, {
      key: "reportByOriginOrCdn",
      value: (o = Wc(is.mark(function e(n, t, o) {
        var i, a, r, c, l, s, g, f, h, p, A, d;
        return is.wrap(function(e) {
          for (;;) switch (e.prev = e.next) {
            case 0:
              i = 10, a = this.getEnv(), a = _.generateDomain(a, !0), r = (c = "POST" == n ? us.POST_DATA : us.SECOND_REQUEST).method, c = c.url, s = this.domainIndexOfLastSuccessRequest;
            case 5:
              if (s < i * a.length) return f = s % a.length, h = a[f], S.initTokenTimeoutReason = gs(g = gs(g = "".concat(ps.reporting, ",trying ")).call(g, s + 1, " times, current domain:")).call(g, h), e.prev = 9, e.next = 12, _.ajax(r, h + c, t, "POST" == n, "POST" == n ? o : void 0);
              e.next = 42;
              break;
            case 12:
              return l = e.sent, this.domainIndexOfLastSuccessRequest = f, e.abrupt("break", 42);
            case 17:
              if (e.prev = 17, e.t0 = e.catch(9), s == i - 1) throw e.t0;
              e.next = 21;
              break;
            case 21:
              if ("string" != typeof e.t0 || !Xl(e.t0).call(e.t0, Bs)) {
                e.next = 37;
                break
              }
              p = void 0;
              try {
                A = JSON.parse(e.t0.replace(Bs, "")), p = A.status
              } catch (e) {
                p = 0
              }
              d = 0;
            case 25:
              if (!(d < 1)) {
                e.next = 37;
                break
              }
              if (550 != p || _.isCdnDomain(h)) {
                e.next = 30;
                break
              }
              return e.next = 29, _.sleep(6e3);
            case 29:
              return e.abrupt("break", 37);
            case 30:
              if (400 <= p && p <= 499) throw e.t0;
              e.next = 32;
              break;
            case 32:
              if (500 <= p && p <= 599) throw e.t0;
              e.next = 34;
              break;
            case 34:
              d++, e.next = 25;
              break;
            case 37:
              return e.next = 39, _.sleep(4e3);
            case 39:
              s++, e.next = 5;
              break;
            case 42:
              return e.abrupt("return", l);
            case 43:
            case "end":
              return e.stop()
          }
        }, e, this, [
          [9, 17]
        ])
      })), function(e, n, t) {
        return o.apply(this, arguments)
      })
    }, {
      key: "_transformBeforeSend",
      value: function(e, t) {
        return S.initTokenTimeoutReason = ps.encrypting, new w(function(n) {
          e.encryptOrDecrypt(B(t)).then(function(e) {
            return n(e)
          }).catch(function(e) {
            t.v12 = (e || 3) + "", n(B(t))
          })
        })
      }
    }, {
      key: "_transformAfterRecive",
      value: function(e, o, i) {
        return S.initTokenTimeoutReason = ps.decrypting, new w(function(n) {
          var t = {};
          if (i) e.encryptOrDecrypt(o, !0).then(function(e) {
            try {
              t = JSON.parse(e || o)
            } catch (e) {}
            n(t)
          }).catch(function(e) {
            e = e, S.dvLastDecryptErrCode = e, _.setLocalStorage(T.DVDecryptErrCode, e + "");
            try {
              t = JSON.parse(o)
            } catch (e) {}
            n(t)
          });
          else {
            try {
              t = JSON.parse(o)
            } catch (e) {}
            n(t)
          }
        })
      }
    }, {
      key: "sendSecondRequest",
      value: function(e, n, t, o, i, a, r) {
        var e = {
            v1: e,
            v3: n,
            u1: t,
            ut: o,
            j74: i
          },
          c = (a && (e.j82 = a), r && (e.j83 = r), e.j68 = this.postDataSpendTime, _.now());
        this.reportByOriginOrCdn("PUT", B(e)).then(function() {
          return _.setLocalStorage(T.DVLastPutSpendTime, _.now() - c + "")
        })
      }
    }, {
      key: "sendSimpleRequest",
      value: function() {
        _.ajax(us.SIMPLE_REQUEST.method, this.getEnv() + us.SIMPLE_REQUEST.url, "")
      }
    }]), e
  }();

  function _s(e) {
    var t, i, o = e = e || {};

    function a() {
      t(o), j()
    }
    o.ready = new w(function(e, n) {
      t = e, i = n
    });
    for (var n = new Uint8Array(123), r = 25; 0 <= r; --r) n[48 + r] = 52 + r, n[65 + r] = r, n[97 + r] = 26 + r;
    n[43] = 62, n[47] = 63, o.wasm = function(e) {
      try {
        for (var n = atob(e), t = new Uint8Array(n.length), o = 0; o < n.length; o++) t[o] = n.charCodeAt(o);
        return t
      } catch (e) {
        i(e)
      }
    }("AGFzbQEAAAABGgVgAX8Bf2ACf38Bf2AAAGABfwBgA39/fwF/AhMDAWEBYQAAAWEBYgABAWEBYwAAAw8OAAADAAAEAgABAQEBAAAEBQFwAQEBBQYBAYACgAIGCQF/AUGAjcACCwclCQFkAgABZQAJAWYAEAFnAAUBaAAPAWkACgFqAA4BawANAWwBAArCSw4+AQJ/AkAgAEUNACAAEAoiAkUNACAABEAgAiEBA0AgAUEAOgAAIAFBAWohASAAQQFrIgANAAsLIAIhAQsgAQt/AQN/IAAhAQJAIABBA3EEQANAIAEtAABFDQIgAUEBaiIBQQNxDQALCwNAIAEiAkEEaiEBIAIoAgAiA0F/cyADQYGChAhrcUGAgYKEeHFFDQALIANB/wFxRQRAIAIgAGsPCwNAIAItAAEhAyACQQFqIgEhAiADDQALCyABIABrC6cMAQd/AkAgAEUNACAAQQhrIgMgAEEEaygCACIBQXhxIgBqIQUCQCABQQFxDQAgAUEDcUUNASADIAMoAgAiAWsiA0GgCSgCAEkNASAAIAFqIQAgA0GkCSgCAEcEQCABQf8BTQRAIAMoAggiAiABQQN2IgRBA3RBuAlqRhogAiADKAIMIgFGBEBBkAlBkAkoAgBBfiAEd3E2AgAMAwsgAiABNgIMIAEgAjYCCAwCCyADKAIYIQYCQCADIAMoAgwiAUcEQCADKAIIIgIgATYCDCABIAI2AggMAQsCQCADQRRqIgIoAgAiBA0AIANBEGoiAigCACIEDQBBACEBDAELA0AgAiEHIAQiAUEUaiICKAIAIgQNACABQRBqIQIgASgCECIEDQALIAdBADYCAAsgBkUNAQJAIAMgAygCHCICQQJ0QcALaiIEKAIARgRAIAQgATYCACABDQFBlAlBlAkoAgBBfiACd3E2AgAMAwsgBkEQQRQgBigCECADRhtqIAE2AgAgAUUNAgsgASAGNgIYIAMoAhAiAgRAIAEgAjYCECACIAE2AhgLIAMoAhQiAkUNASABIAI2AhQgAiABNgIYDAELIAUoAgQiAUEDcUEDRw0AQZgJIAA2AgAgBSABQX5xNgIEIAMgAEEBcjYCBCAAIANqIAA2AgAPCyADIAVPDQAgBSgCBCIBQQFxRQ0AAkAgAUECcUUEQCAFQagJKAIARgRAQagJIAM2AgBBnAlBnAkoAgAgAGoiADYCACADIABBAXI2AgQgA0GkCSgCAEcNA0GYCUEANgIAQaQJQQA2AgAPCyAFQaQJKAIARgRAQaQJIAM2AgBBmAlBmAkoAgAgAGoiADYCACADIABBAXI2AgQgACADaiAANgIADwsgAUF4cSAAaiEAAkAgAUH/AU0EQCAFKAIIIgIgAUEDdiIEQQN0QbgJakYaIAIgBSgCDCIBRgRAQZAJQZAJKAIAQX4gBHdxNgIADAILIAIgATYCDCABIAI2AggMAQsgBSgCGCEGAkAgBSAFKAIMIgFHBEAgBSgCCCICQaAJKAIASRogAiABNgIMIAEgAjYCCAwBCwJAIAVBFGoiAigCACIEDQAgBUEQaiICKAIAIgQNAEEAIQEMAQsDQCACIQcgBCIBQRRqIgIoAgAiBA0AIAFBEGohAiABKAIQIgQNAAsgB0EANgIACyAGRQ0AAkAgBSAFKAIcIgJBAnRBwAtqIgQoAgBGBEAgBCABNgIAIAENAUGUCUGUCSgCAEF+IAJ3cTYCAAwCCyAGQRBBFCAGKAIQIAVGG2ogATYCACABRQ0BCyABIAY2AhggBSgCECICBEAgASACNgIQIAIgATYCGAsgBSgCFCICRQ0AIAEgAjYCFCACIAE2AhgLIAMgAEEBcjYCBCAAIANqIAA2AgAgA0GkCSgCAEcNAUGYCSAANgIADwsgBSABQX5xNgIEIAMgAEEBcjYCBCAAIANqIAA2AgALIABB/wFNBEAgAEEDdiIBQQN0QbgJaiEAAn9BkAkoAgAiAkEBIAF0IgFxRQRAQZAJIAEgAnI2AgAgAAwBCyAAKAIICyECIAAgAzYCCCACIAM2AgwgAyAANgIMIAMgAjYCCA8LQR8hAiADQgA3AhAgAEH///8HTQRAIABBCHYiASABQYD+P2pBEHZBCHEiAXQiAiACQYDgH2pBEHZBBHEiAnQiBCAEQYCAD2pBEHZBAnEiBHRBD3YgASACciAEcmsiAUEBdCAAIAFBFWp2QQFxckEcaiECCyADIAI2AhwgAkECdEHAC2ohAQJAAkACQEGUCSgCACIEQQEgAnQiB3FFBEBBlAkgBCAHcjYCACABIAM2AgAgAyABNgIYDAELIABBAEEZIAJBAXZrIAJBH0YbdCECIAEoAgAhAQNAIAEiBCgCBEF4cSAARg0CIAJBHXYhASACQQF0IQIgBCABQQRxaiIHQRBqKAIAIgENAAsgByADNgIQIAMgBDYCGAsgAyADNgIMIAMgAzYCCAwBCyAEKAIIIgAgAzYCDCAEIAM2AgggA0EANgIYIAMgBDYCDCADIAA2AggLQbAJQbAJKAIAQQFrIgBBfyAAGzYCAAsLTAEDf0GMCSgCACICIABBA2pBfHEiA2ohAUF/IQACQCADQQAgASACTRsNACABPwBBEHRLBEAgARAARQ0BC0GMCSABNgIAIAIhAAsgAAugAQEEfwJ/QcEAIQJByAghAQJAQcgILQAAIABB/wFxRg0AIABB/wFxQYGChAhsIQMDQCABKAIAIANzIgRBf3MgBEGBgoQIa3FBgIGChHhxDQEgAUEEaiEBIAJBBGsiAkEDSw0ACwsgAgRAIABB/wFxIQADQCABIAAgAS0AAEYNAhogAUEBaiEBIAJBAWsiAg0ACwtBAAsiAEHICGtBfyAAGwszAQF/IAIEQCAAIQMDQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQQFrIgINAAsLIAALAwABC/8sAQx/IwBBEGsiDCQAAkACQAJAAkACQAJAAkACQAJAAkACQCAAQfQBTQRAQZAJKAIAIgVBECAAQQtqQXhxIABBC0kbIgZBA3YiAHYiAUEDcQRAIAFBf3NBAXEgAGoiAkEDdCIEQcAJaigCACIBQQhqIQACQCABKAIIIgMgBEG4CWoiBEYEQEGQCSAFQX4gAndxNgIADAELIAMgBDYCDCAEIAM2AggLIAEgAkEDdCICQQNyNgIEIAEgAmoiASABKAIEQQFyNgIEDAwLIAZBmAkoAgAiCE0NASABBEACQEECIAB0IgJBACACa3IgASAAdHEiAEEAIABrcUEBayIAIABBDHZBEHEiAHYiAUEFdkEIcSICIAByIAEgAnYiAEECdkEEcSIBciAAIAF2IgBBAXZBAnEiAXIgACABdiIAQQF2QQFxIgFyIAAgAXZqIgJBA3QiA0HACWooAgAiASgCCCIAIANBuAlqIgNGBEBBkAkgBUF+IAJ3cSIFNgIADAELIAAgAzYCDCADIAA2AggLIAFBCGohACABIAZBA3I2AgQgASAGaiIHIAJBA3QiAiAGayIDQQFyNgIEIAEgAmogAzYCACAIBEAgCEEDdiIEQQN0QbgJaiEBQaQJKAIAIQICfyAFQQEgBHQiBHFFBEBBkAkgBCAFcjYCACABDAELIAEoAggLIQQgASACNgIIIAQgAjYCDCACIAE2AgwgAiAENgIIC0GkCSAHNgIAQZgJIAM2AgAMDAtBlAkoAgAiCkUNASAKQQAgCmtxQQFrIgAgAEEMdkEQcSIAdiIBQQV2QQhxIgIgAHIgASACdiIAQQJ2QQRxIgFyIAAgAXYiAEEBdkECcSIBciAAIAF2IgBBAXZBAXEiAXIgACABdmpBAnRBwAtqKAIAIgEoAgRBeHEgBmshAyABIQIDQAJAIAIoAhAiAEUEQCACKAIUIgBFDQELIAAoAgRBeHEgBmsiAiADIAIgA0kiAhshAyAAIAEgAhshASAAIQIMAQsLIAEgBmoiCyABTQ0CIAEoAhghCSABIAEoAgwiBEcEQCABKAIIIgBBoAkoAgBJGiAAIAQ2AgwgBCAANgIIDAsLIAFBFGoiAigCACIARQRAIAEoAhAiAEUNBCABQRBqIQILA0AgAiEHIAAiBEEUaiICKAIAIgANACAEQRBqIQIgBCgCECIADQALIAdBADYCAAwKC0F/IQYgAEG/f0sNACAAQQtqIgBBeHEhBkGUCSgCACIIRQ0AQR8hB0EAIAZrIQMCQAJAAkACfyAGQf///wdNBEAgAEEIdiIAIABBgP4/akEQdkEIcSIAdCIBIAFBgOAfakEQdkEEcSIBdCICIAJBgIAPakEQdkECcSICdEEPdiAAIAFyIAJyayIAQQF0IAYgAEEVanZBAXFyQRxqIQcLIAdBAnRBwAtqKAIAIgJFCwRAQQAhAAwBC0EAIQAgBkEAQRkgB0EBdmsgB0EfRht0IQEDQAJAIAIoAgRBeHEgBmsiBSADTw0AIAIhBCAFIgMNAEEAIQMgAiEADAMLIAAgAigCFCIFIAUgAiABQR12QQRxaigCECICRhsgACAFGyEAIAFBAXQhASACDQALCyAAIARyRQRAQQIgB3QiAEEAIABrciAIcSIARQ0DIABBACAAa3FBAWsiACAAQQx2QRBxIgB2IgFBBXZBCHEiAiAAciABIAJ2IgBBAnZBBHEiAXIgACABdiIAQQF2QQJxIgFyIAAgAXYiAEEBdkEBcSIBciAAIAF2akECdEHAC2ooAgAhAAsgAEUNAQsDQCAAKAIEQXhxIAZrIgUgA0khASAFIAMgARshAyAAIAQgARshBCAAKAIQIgIEfyACBSAAKAIUCyIADQALCyAERQ0AIANBmAkoAgAgBmtPDQAgBCAGaiIHIARNDQEgBCgCGCEJIAQgBCgCDCIBRwRAIAQoAggiAEGgCSgCAEkaIAAgATYCDCABIAA2AggMCQsgBEEUaiICKAIAIgBFBEAgBCgCECIARQ0EIARBEGohAgsDQCACIQUgACIBQRRqIgIoAgAiAA0AIAFBEGohAiABKAIQIgANAAsgBUEANgIADAgLIAZBmAkoAgAiAU0EQEGkCSgCACEAAkAgASAGayICQRBPBEBBmAkgAjYCAEGkCSAAIAZqIgM2AgAgAyACQQFyNgIEIAAgAWogAjYCACAAIAZBA3I2AgQMAQtBpAlBADYCAEGYCUEANgIAIAAgAUEDcjYCBCAAIAFqIgEgASgCBEEBcjYCBAsgAEEIaiEADAoLIAZBnAkoAgAiAUkEQEGcCSABIAZrIgE2AgBBqAlBqAkoAgAiACAGaiICNgIAIAIgAUEBcjYCBCAAIAZBA3I2AgQgAEEIaiEADAoLQQAhACAGQS9qIgUCf0HoDCgCAARAQfAMKAIADAELQfQMQn83AgBB7AxCgKCAgICABDcCAEHoDCAMQQxqQXBxQdiq1aoFczYCAEH8DEEANgIAQcwMQQA2AgBBgCALIgNqIgdBACADayIIcSICIAZNDQlByAwoAgAiAwRAQcAMKAIAIgQgAmoiCSAETSADIAlJcg0KC0HMDC0AAEEEcQ0FAkACQEGoCSgCACIEBEBB0AwhAwNAIAQgAygCACIJTwRAIAkgAygCBGogBEsNAwsgAygCCCIDDQALC0EAEAYiAUF/Rg0GIAIhBEHsDCgCACIDQQFrIgcgAXEEQCACIAFrIAEgB2pBACADa3FqIQQLIAQgBk0gBEH+////B0tyDQZByAwoAgAiAwRAQcAMKAIAIgcgBGoiCCAHTSADIAhJcg0HCyAEEAYiAyABRw0BDAgLIAcgAWsgCHEiBEH+////B0sNBSAEEAYiASADKAIAIAMoAgRqRg0EIAEhAwsgA0F/RiAGQTBqIARNckUEQEHwDCgCACIBIAUgBGtqQQAgAWtxIgFB/v///wdLBEAgAyEBDAgLIAEQBkF/RwRAIAEgBGohBCADIQEMCAtBACAEaxAGGgwFCyADIgFBf0cNBgwECwALQQAhBAwGC0EAIQEMBAsgAUF/Rw0CC0HMDEHMDCgCAEEEcjYCAAsgAkH+////B0sNAyACEAYiAUF/RkEAEAYiAkF/RnIgASACT3INAyACIAFrIgQgBkEoak0NAwtBwAxBwAwoAgAgBGoiADYCAEHEDCgCACAASQRAQcQMIAA2AgALAkACQAJAQagJKAIAIgMEQEHQDCEAA0AgASAAKAIAIgIgACgCBCIFakYNAiAAKAIIIgANAAsMAgtBoAkoAgAiAEEAIAAgAU0bRQRAQaAJIAE2AgALQQAhAEHUDCAENgIAQdAMIAE2AgBBsAlBfzYCAEG0CUHoDCgCADYCAEHcDEEANgIAA0AgAEEDdCICQcAJaiACQbgJaiIDNgIAIAJBxAlqIAM2AgAgAEEBaiIAQSBHDQALQZwJIARBKGsiAEF4IAFrQQdxQQAgAUEIakEHcRsiAmsiAzYCAEGoCSABIAJqIgI2AgAgAiADQQFyNgIEIAAgAWpBKDYCBEGsCUH4DCgCADYCAAwCCyABIANNDQAgACgCDEEIcSACIANLcg0AIAAgBCAFajYCBEGoCSADQXggA2tBB3FBACADQQhqQQdxGyIAaiIBNgIAQZwJQZwJKAIAIARqIgIgAGsiADYCACABIABBAXI2AgQgAiADakEoNgIEQawJQfgMKAIANgIADAELQaAJKAIAIAFLBEBBoAkgATYCAAsgASAEaiECQdAMIQACQAJAAkACQAJAAkADQCACIAAoAgBHBEAgACgCCCIADQEMAgsLIAAtAAxBCHFFDQELQdAMIQADQCADIAAoAgAiAk8EQCACIAAoAgRqIgUgA0sNAwsgACgCCCEADAALAAsgACABNgIAIAAgACgCBCAEajYCBCABQXggAWtBB3FBACABQQhqQQdxG2oiCCAGQQNyNgIEIAJBeCACa0EHcUEAIAJBCGpBB3EbaiIEIAYgCGoiBWshAiADIARGBEBBqAkgBTYCAEGcCUGcCSgCACACaiIANgIAIAUgAEEBcjYCBAwDCyAEQaQJKAIARgRAQaQJIAU2AgBBmAlBmAkoAgAgAmoiADYCACAFIABBAXI2AgQgACAFaiAANgIADAMLIAQoAgQiAEEDcUEBRgRAIABBeHEhCQJAIABB/wFNBEAgBCgCCCIBIABBA3YiA0EDdEG4CWpGGiABIAQoAgwiAEYEQEGQCUGQCSgCAEF+IAN3cTYCAAwCCyABIAA2AgwgACABNgIIDAELIAQoAhghBwJAIAQgBCgCDCIBRwRAIAQoAggiACABNgIMIAEgADYCCAwBCwJAIARBFGoiACgCACIDDQAgBEEQaiIAKAIAIgMNAEEAIQEMAQsDQCAAIQYgAyIBQRRqIgAoAgAiAw0AIAFBEGohACABKAIQIgMNAAsgBkEANgIACyAHRQ0AAkAgBCAEKAIcIgBBAnRBwAtqIgMoAgBGBEAgAyABNgIAIAENAUGUCUGUCSgCAEF+IAB3cTYCAAwCCyAHQRBBFCAHKAIQIARGG2ogATYCACABRQ0BCyABIAc2AhggBCgCECIABEAgASAANgIQIAAgATYCGAsgBCgCFCIARQ0AIAEgADYCFCAAIAE2AhgLIAQgCWohBCACIAlqIQILIAQgBCgCBEF+cTYCBCAFIAJBAXI2AgQgAiAFaiACNgIAIAJB/wFNBEAgAkEDdiIBQQN0QbgJaiEAAn9BkAkoAgAiAkEBIAF0IgFxRQRAQZAJIAEgAnI2AgAgAAwBCyAAKAIICyEDIAAgBTYCCCADIAU2AgwgBSAANgIMIAUgAzYCCAwDC0EfIQAgAkH///8HTQRAIAJBCHYiACAAQYD+P2pBEHZBCHEiAHQiASABQYDgH2pBEHZBBHEiAXQiAyADQYCAD2pBEHZBAnEiA3RBD3YgACABciADcmsiAEEBdCACIABBFWp2QQFxckEcaiEACyAFIAA2AhwgBUIANwIQIABBAnRBwAtqIQECQEGUCSgCACIDQQEgAHQiBHFFBEBBlAkgAyAEcjYCACABIAU2AgAgBSABNgIYDAELIAJBAEEZIABBAXZrIABBH0YbdCEAIAEoAgAhAQNAIAEiAygCBEF4cSACRg0DIABBHXYhASAAQQF0IQAgAyABQQRxaiIEQRBqKAIAIgENAAsgBCAFNgIQIAUgAzYCGAsgBSAFNgIMIAUgBTYCCAwCC0GcCSAEQShrIgBBeCABa0EHcUEAIAFBCGpBB3EbIgJrIgc2AgBBqAkgASACaiICNgIAIAIgB0EBcjYCBCAAIAFqQSg2AgRBrAlB+AwoAgA2AgAgAyAFQScgBWtBB3FBACAFQSdrQQdxG2pBL2siACAAIANBEGpJGyICQRs2AgQgAkHYDCkCADcCECACQdAMKQIANwIIQdgMIAJBCGo2AgBB1AwgBDYCAEHQDCABNgIAQdwMQQA2AgAgAkEYaiEAA0AgAEEHNgIEIABBCGohASAAQQRqIQAgASAFSQ0ACyACIANGDQMgAiACKAIEQX5xNgIEIAMgAiADayIEQQFyNgIEIAIgBDYCACAEQf8BTQRAIARBA3YiAUEDdEG4CWohAAJ/QZAJKAIAIgJBASABdCIBcUUEQEGQCSABIAJyNgIAIAAMAQsgACgCCAshAiAAIAM2AgggAiADNgIMIAMgADYCDCADIAI2AggMBAtBHyEAIANCADcCECAEQf///wdNBEAgBEEIdiIAIABBgP4/akEQdkEIcSIAdCIBIAFBgOAfakEQdkEEcSIBdCICIAJBgIAPakEQdkECcSICdEEPdiAAIAFyIAJyayIAQQF0IAQgAEEVanZBAXFyQRxqIQALIAMgADYCHCAAQQJ0QcALaiEBAkBBlAkoAgAiAkEBIAB0IgVxRQRAQZQJIAIgBXI2AgAgASADNgIAIAMgATYCGAwBCyAEQQBBGSAAQQF2ayAAQR9GG3QhACABKAIAIQEDQCABIgIoAgRBeHEgBEYNBCAAQR12IQEgAEEBdCEAIAIgAUEEcWoiBUEQaigCACIBDQALIAUgAzYCECADIAI2AhgLIAMgAzYCDCADIAM2AggMAwsgAygCCCIAIAU2AgwgAyAFNgIIIAVBADYCGCAFIAM2AgwgBSAANgIICyAIQQhqIQAMBAsgAigCCCIAIAM2AgwgAiADNgIIIANBADYCGCADIAI2AgwgAyAANgIIC0EAIQBBnAkoAgAiASAGTQ0CQZwJIAEgBmsiATYCAEGoCUGoCSgCACIAIAZqIgI2AgAgAiABQQFyNgIEIAAgBkEDcjYCBCAAQQhqIQAMAgsCQCAJRQ0AAkAgBCgCHCIAQQJ0QcALaiICKAIAIARGBEAgAiABNgIAIAENAUGUCSAIQX4gAHdxIgg2AgAMAgsgCUEQQRQgCSgCECAERhtqIAE2AgAgAUUNAQsgASAJNgIYIAQoAhAiAARAIAEgADYCECAAIAE2AhgLIAQoAhQiAEUNACABIAA2AhQgACABNgIYCwJAIANBD00EQCAEIAMgBmoiAEEDcjYCBCAAIARqIgAgACgCBEEBcjYCBAwBCyAEIAZBA3I2AgQgByADQQFyNgIEIAMgB2ogAzYCACADQf8BTQRAIANBA3YiAUEDdEG4CWohAAJ/QZAJKAIAIgJBASABdCIBcUUEQEGQCSABIAJyNgIAIAAMAQsgACgCCAshAyAAIAc2AgggAyAHNgIMIAcgADYCDCAHIAM2AggMAQtBHyEAIANB////B00EQCADQQh2IgAgAEGA/j9qQRB2QQhxIgB0IgEgAUGA4B9qQRB2QQRxIgF0IgIgAkGAgA9qQRB2QQJxIgJ0QQ92IAAgAXIgAnJrIgBBAXQgAyAAQRVqdkEBcXJBHGohAAsgByAANgIcIAdCADcCECAAQQJ0QcALaiEBAkACQCAIQQEgAHQiAnFFBEBBlAkgAiAIcjYCACABIAc2AgAMAQsgA0EAQRkgAEEBdmsgAEEfRht0IQAgASgCACEGA0AgBiIBKAIEQXhxIANGDQIgAEEddiECIABBAXQhACABIAJBBHFqIgJBEGooAgAiBg0ACyACIAc2AhALIAcgATYCGCAHIAc2AgwgByAHNgIIDAELIAEoAggiACAHNgIMIAEgBzYCCCAHQQA2AhggByABNgIMIAcgADYCCAsgBEEIaiEADAELAkAgCUUNAAJAIAEoAhwiAEECdEHAC2oiAigCACABRgRAIAIgBDYCACAEDQFBlAkgCkF+IAB3cTYCAAwCCyAJQRBBFCAJKAIQIAFGG2ogBDYCACAERQ0BCyAEIAk2AhggASgCECIABEAgBCAANgIQIAAgBDYCGAsgASgCFCIARQ0AIAQgADYCFCAAIAQ2AhgLAkAgA0EPTQRAIAEgAyAGaiIAQQNyNgIEIAAgAWoiACAAKAIEQQFyNgIEDAELIAEgBkEDcjYCBCALIANBAXI2AgQgAyALaiADNgIAIAgEQCAIQQN2IgRBA3RBuAlqIQBBpAkoAgAhAgJ/QQEgBHQiBCAFcUUEQEGQCSAEIAVyNgIAIAAMAQsgACgCCAshBiAAIAI2AgggBiACNgIMIAIgADYCDCACIAY2AggLQaQJIAs2AgBBmAkgAzYCAAsgAUEIaiEACyAMQRBqJAAgAAvMAQECfwJAAkAgASAAIgNzQQNxDQAgAUEDcQRAA0AgAyABLQAAIgI6AAAgAkUNAyADQQFqIQMgAUEBaiIBQQNxDQALCyABKAIAIgJBf3MgAkGBgoQIa3FBgIGChHhxDQADQCADIAI2AgAgASgCBCECIANBBGohAyABQQRqIQEgAkGBgoQIayACQX9zcUGAgYKEeHFFDQALCyADIAEtAAAiAjoAACACRQ0AA0AgAyABLQABIgI6AAEgA0EBaiEDIAFBAWohASACDQALCyAAC+gCAQZ/IABFBEBBAA8LIAEQAyIGBEADfyABIAJGBH9BACEAAkAgAUEBdEFAaxADIgJFDQADQAJAIAEgA0oEQCAAIAJqIAMgBmotAAAiBEECdkHICGotAAA6AAAgAEEBciEFIARBBHRBMHEhBAJ/IABBAnIgASADQQFqIgdMDQAaIAIgBWogBCAGIAdqLQAAIgdBBHZyQcgIai0AADoAACAAQQJyIQUgB0ECdEE8cSEEIANBAmoiByABSA0CIABBA3ILIQAgAiAFaiAEQcgIai0AADoAAAsgACACakEAOgAADAILIAIgBWogBiAHai0AACIFQQZ2IARyQcgIai0AADoAACACIABBA3JqIAVBP3FByAhqLQAAOgAAIANBA2ohAyAAQQRqIQAMAAsACyACBSACIAZqIAJBMHBBgAhqLQAAIAAgAmotAABBACACQQFxa3NzOgAAIAJBAWohAgwBCwshAgsgBhAFIAILBABBAAvmBQEKfyMAQTBrIgQkAAJAAkAgAARAIAAtAAANAQtBACEAIAFFDQEgAUECOgAADAELIwBBEGsiAiQAIAJBCGpBABABGiACKAIIIQMgAkEQaiQAIAMhCQJAAkACf0EAIQICQCAARQ0AIAAtAABFDQBBEBADIgNFDQAgABAEIgJBACACQQBKGyELQQEhB0EAIQIDQAJAIAIgC0YNACAAIAJqLQAAIgVBLUcEQAJAIAVBMGsiCEH/AXFBCkkNACAFQeEAa0H/AXFBBU0EQCAFQdcAayEIDAELIAVBN2sgBSAFQcEAa0H/AXFBBkkbIQgLAkAgBwRAIAhBBHQhCgwBCyADIAZqIAggCmo6AAAgBkEOSg0CIAZBAWohBgsgB0UhBwsgAkEBaiECDAELCyADIQILIAIiBUULBEBBACECIAFFDQEgAUEDOgAADAELQbAIEAIiAkUEQEEAIQIgAUUNASABQQQ6AAAMAQsgAhAEIgBBAWoQAyIDRQRAQQAhAiABRQ0BIAFBBToAAAwBCyAJQRh2IQYgCUEQdiEIIAlBCHYhByADIAIQCyEDAkADQCAAQQFrIgBBAEgNASAAIANqIgItAABBLkcNAAsgAkEAOgAACyADEAQhACAEQgA3AxggBCAJOgADIAQgBzoAAiAEIAg6AAEgBCAGOgAAIARCADcDECAEIAUpAAA3AgQgBCAFKQAINwIMIARBFGohAgJAIABBDE0EQCACIAMgABAIGgwBCyACIAAgA2pBDGsiACkAADcAACACIAAoAAg2AAgLIARBAToAICAEQSEQDCICRQRAQQAhACABRQ0CIAFBBjoAAAwCCyACEARBA2oQAyIARQRAQQAhACABRQ0CIAFBBzoAAAwCCyAAQccILQAAOgACIABBxQgvAAA7AAAgABAEIABqIAIQCxoMAQtBACEAQQAhAwsgBRAFIAMQBSACEAUgAUUgAEVyDQAgAUEBOgAACyAEQTBqJAAgAAvqAwEHfwJAIABFDQAgABAEIgNFDQACQAJAIAMQAyIDRQ0AAn9BfyEBAkACQCAARQ0AIAAQBCICQQpqEAMiBEUNACAEIAAgAhAIIQQCQCACQQRvIgBFDQBBBCAAayEBQQAhAANAIAAgAUYNASAEIAAgAmpqQT06AAAgAEEBaiEADAALAAtBACEAQQAhAQNAIAAgBGotAAAiAgRAIAJBGHRBGHUQByIGQX9MDQMgBCAAQQFyaiwAABAHIgJBf0wNAyABIANqIAJBBHZBA3EgBkECdHI6AAACfyABQQFqIgcgBCAAQQJyai0AACIGQT1GDQAaIAZBGHRBGHUQByIGQX9MDQQgAyAHaiAGQQJ2QQ9xIAJBBHRyOgAAIAFBAmoiAiAEIABBA3JqLQAAIgdBPUYNABogB0EYdEEYdRAHIgdBf0wNBCACIANqIAdBP3EgBkEGdHI6AAAgAUEDagshASAAQQRqIQAMAQsLIAEgA2pBADoAACAEEAULIAEMAQsgBBAFQX8LIgBBAEgNAQNAIAAgBUYEQCAAQQFqEAMiBUUNAiAFIAMgABAIGgwDBSADIAVqIgEgBUEwcEGACGotAAAgAS0AAEEAIAVBAXFrc3M6AAAgBUEBaiEFDAELAAsAC0EAIQULIAMQBQsgBQsfAQJ/AkAgAEUNACAAEAQiAkUNACAAIAIQDCEBCyABCwuZAQIAQYAIC4gBW/7+qRi8x6BvMPQecI9pl1kwr9KJck8LHprHIIxu9LO7wsqOhkM5ior3GyiCthaJd2luZG93LmxvY2F0aW9uLmhvc3QAQ0oAQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODktXwBBjAkLA4AGUA==");
    var c, g, l, f = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;

    function s(e, n) {
      if (e) {
        for (var t = g, o = e, i = o + n, a = o; t[a] && !(i <= a);) ++a;
        if (16 < a - o && t.subarray && f) return f.decode(t.subarray(o, a));
        for (var r = ""; o < a;) {
          var c, l, s = t[o++];
          128 & s ? (l = 63 & t[o++], 192 == (224 & s) ? r += String.fromCharCode((31 & s) << 6 | l) : (c = 63 & t[o++], (s = 224 == (240 & s) ? (15 & s) << 12 | l << 6 | c : (7 & s) << 18 | l << 12 | c << 6 | 63 & t[o++]) < 65536 ? r += String.fromCharCode(s) : (l = s - 65536, r += String.fromCharCode(55296 | l >> 10, 56320 | 1023 & l)))) : r += String.fromCharCode(s)
        }
        return r
      }
      return ""
    }

    function h(e, n, t) {
      var o = e,
        i = g,
        a = n,
        e = t;
      if (!(0 < e)) return 0;
      for (var n = a, r = a + e - 1, c = 0; c < o.length; ++c) {
        var l = o.charCodeAt(c);
        if ((l = 55296 <= l && l <= 57343 ? 65536 + ((1023 & l) << 10) | 1023 & o.charCodeAt(++c) : l) <= 127) {
          if (r <= a) break;
          i[a++] = l
        } else if (l <= 2047) {
          if (r <= a + 1) break;
          i[a++] = 192 | l >> 6, i[a++] = 128 | 63 & l
        } else if (l <= 65535) {
          if (r <= a + 2) break;
          i[a++] = 224 | l >> 12, i[a++] = 128 | l >> 6 & 63, i[a++] = 128 | 63 & l
        } else {
          if (r <= a + 3) break;
          i[a++] = 240 | l >> 18, i[a++] = 128 | l >> 12 & 63, i[a++] = 128 | l >> 6 & 63, i[a++] = 128 | 63 & l
        }
      }
      return i[a] = 0, a - n
    }

    function p(e) {
      for (var n = 0, t = 0; t < e.length; ++t) {
        var o = e.charCodeAt(t);
        (o = 55296 <= o && o <= 57343 ? 65536 + ((1023 & o) << 10) | 1023 & e.charCodeAt(++t) : o) <= 127 ? ++n : n += o <= 2047 ? 2 : o <= 65535 ? 3 : 4
      }
      return n
    }
    var A = {
      a: function(e) {
        throw g.length, "OOM"
      },
      c: function e(n) {
        n = (0, eval)(s(n));
        if (null == n) return 0;
        var t = e,
          o = p(n += "");
        return (!t.bufferSize || t.bufferSize < o + 1) && (t.bufferSize && m(t.buffer), t.bufferSize = o + 1, t.buffer = b(t.bufferSize)), h(n, t.buffer, t.bufferSize), t.buffer
      },
      b: function(e) {
        var n = Date.now();
        return c[e >> 2] = n / 1e3 | 0, c[e + 4 >> 2] = n % 1e3 * 1e3 | 0, 0
      }
    };
    o.UTF8ToString = s, o.stringToUTF8 = h, o.lengthBytesUTF8 = p;
    var d, m, u, b, k, j, A = {
      a: A
    };
    try {
      WebAssembly.instantiate(o.wasm, A).then(function(e) {
        try {
          var n = e.instance.exports;
          d = n.f, m = n.g, u = n.h, b = n.i, k = n.j, j = n.k, n.l, l = n.d, t = l.buffer, c = new Int32Array(t), g = new Uint8Array(t), o._edge_js_encrypt = d, o._edge_js_decrypt = u, o._malloc = b, o._free = m, o._edge_get_client_token = k, o.HEAPU8 = g, n.e(), a()
        } catch (e) {
          i(e)
        }
        var t
      }).catch(function(e) {
        i(e)
      })
    } catch (e) {
      i(e)
    }
    return e.ready
  }
  var Rs = function() {
    function e() {
      var n = this;
      Kc(this, e), ! function() {
        try {
          return !!(w && WebAssembly && WebAssembly.instantiate && Int8Array && Int16Array && Int32Array && Uint8Array && Uint16Array && Uint32Array && Float32Array && Float64Array && eval)
        } catch (e) {
          return
        }
      }() ? this.status = Q.NOT_SUPPORT : (this.status = Q.RUNNING, this.waitingForExcute = [], os(function() {
        n.status === Q.RUNNING && (n.status = Q.TIMEOUT, n.waitingForExcute.forEach(function(e) {
          return e()
        }))
      }, S.WASM_INITIAL_TIMEOUT), _s().then(function(e) {
        n.status = Q.SUCCESS, n.module = e, n.waitingForExcute.forEach(function(e) {
          return e()
        })
      }).catch(function() {
        n.status === Q.RUNNING && (n.status = Q.NOT_SUPPORT, n.waitingForExcute.forEach(function(e) {
          return e()
        }))
      }))
    }
    return tl(e, [{
      key: "waitUntilInitEnd",
      value: function() {
        var t = this;
        return new w(function(e, n) {
          switch (t.status) {
            case Q.RUNNING:
              t.waitingForExcute.push(function() {
                return (t.status == Q.SUCCESS ? e : n)()
              });
              break;
            case Q.SUCCESS:
              e();
              break;
            case Q.NOT_SUPPORT:
            case Q.TIMEOUT:
            default:
              n()
          }
        })
      }
    }, {
      key: "generateCjByWasm",
      value: function(e) {
        if (!this.module) throw 15;
        var n = 0,
          t = 0,
          o = 0;
        try {
          var i = this.module.lengthBytesUTF8(e),
            n = this.module._malloc(i + 1);
          if (0 == (o = this.module._malloc(1))) throw 16;
          if (0 == n) throw 17;
          if (this.module.HEAPU8[o] = 1, this.module.stringToUTF8(e, n, i + 1), 0 == (t = this.module._edge_get_client_token(n, o))) throw 18;
          var a = this.module.UTF8ToString(t),
            r = this.module.HEAPU8[o];
          if (1 != r) throw r;
          return a
        } catch (e) {
          throw e
        } finally {
          n && this.module._free(n), t && this.module._free(t), o && this.module._free(o)
        }
      }
    }, {
      key: "encryptOrDecrypt",
      value: function(r) {
        var c = this,
          l = 1 < arguments.length && void 0 !== arguments[1] && arguments[1];
        return new w(function(i, a) {
          c.waitUntilInitEnd().then(function() {
            if (c.module) {
              var e = 0,
                n = 0;
              try {
                var t = c.module.lengthBytesUTF8(r);
                if (0 == (e = c.module._malloc(t + 1))) return void a(4);
                if (c.module.stringToUTF8(r, e, t + 1), 0 == (n = l ? c.module._edge_js_decrypt(e) : c.module._edge_js_encrypt(e))) return void a(5);
                var o = c.module.UTF8ToString(n);
                i(o)
              } catch (e) {
                a(3)
              } finally {
                e && c.module._free(e), n && c.module._free(n)
              }
            } else a(2)
          }).catch(function() {
            a(1)
          })
        })
      }
    }]), e
  }();
  oe = {
    exports: {}
  }, g = {
    exports: {}
  };
  f({
    target: "Array",
    stat: !0
  }, {
    isArray: jn
  });

  function xs(e) {
    var n, t, o, i, a, r, c = Fs(e),
      e = "function" == typeof this ? this : Array,
      l = arguments.length,
      s = 1 < l ? arguments[1] : void 0,
      g = void 0 !== s,
      f = Vs(c),
      h = 0;
    if (g && (s = Ms(s, 2 < l ? arguments[2] : void 0, 2)), null == f || e == Array && Js(f))
      for (t = new e(n = Hs(c.length)); h < n; h++) r = g ? s(c[h], h) : c[h], Ys(t, h, r);
    else
      for (a = (i = qs(c, f)).next, t = new e; !(o = a.call(i)).done; h++) r = g ? Gs(i, s, [o.value, h], !0) : o.value, Ys(t, h, r);
    return t.length = h, t
  }
  var Ns, Ps, Us, jo = ie.Array.isArray,
    Ro = (Ns = jo, (e = g).exports = function(e) {
      if (Ns(e)) return e
    }, e.exports.default = e.exports, e.exports.__esModule = !0, {
      exports: {}
    }),
    No = (Ps = xo, Us = Aa, (m = Ro).exports = function(e, n) {
      var t = null == e ? null : void 0 !== Ps && Us(e) || e["@@iterator"];
      if (null != t) {
        var o, i, a = [],
          r = !0,
          c = !1;
        try {
          for (t = t.call(e); !(r = (o = t.next()).done) && (a.push(o.value), !n || a.length !== n); r = !0);
        } catch (e) {
          c = !0, i = e
        } finally {
          try {
            r || null == t.return || t.return()
          } finally {
            if (c) throw i
          }
        }
        return a
      }
    }, m.exports.default = m.exports, m.exports.__esModule = !0, {
      exports: {}
    }),
    ee = wl,
    Os = tn,
    Ls = ma,
    Ms = $e,
    Fs = me,
    Gs = function(n, e, t, o) {
      try {
        return o ? e(Os(t)[0], t[1]) : e(t)
      } catch (e) {
        Ls(n, "throw", e)
      }
    },
    Js = pa,
    Hs = Bn,
    Ys = Tn,
    qs = da,
    Vs = Aa,
    Go = xs;
  f({
    target: "Array",
    stat: !0,
    forced: !er(function(e) {
      Array.from(e)
    })
  }, {
    from: Go
  });

  function Ws(e, n) {
    var t = e.length,
      o = ig(t / 2);
    if (t < 8) {
      for (var i, a, r = e, c = n, l = r.length, s = 1; s < l;) {
        for (i = r[a = s]; a && 0 < c(r[a - 1], i);) r[a] = r[--a];
        a !== s++ && (r[a] = i)
      }
      return r
    }
    for (var g = Ws(e.slice(0, o), n), f = Ws(e.slice(o), n), h = n, p = g.length, A = f.length, d = 0, m = 0, u = []; d < p || m < A;) d < p && m < A ? u.push(h(g[d], f[m]) <= 0 ? g[d++] : f[m++]) : u.push(d < p ? g[d++] : f[m++]);
    return u
  }
  var Ks, Xs, zs, Zs, $s, eg, ng, $a = ie.Array.from,
    b = {
      exports: {}
    },
    n = ((r = b).exports = function(e, n) {
      (null == n || n > e.length) && (n = e.length);
      for (var t = 0, o = new Array(n); t < n; t++) o[t] = e[t];
      return o
    }, r.exports.default = r.exports, r.exports.__esModule = !0, Ks = ee, Xs = $a, zs = b.exports, (s = No).exports = function(e, n) {
      if (e) {
        if ("string" == typeof e) return zs(e, n);
        var t = Ks(t = Object.prototype.toString.call(e)).call(t, 8, -1);
        return "Map" === (t = "Object" === t && e.constructor ? e.constructor.name : t) || "Set" === t ? Xs(e) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? zs(e, n) : void 0
      }
    }, s.exports.default = s.exports, s.exports.__esModule = !0, {
      exports: {}
    }),
    tg = ((p = n).exports = function() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
    }, p.exports.default = p.exports, p.exports.__esModule = !0, Zs = g.exports, $s = Ro.exports, eg = No.exports, ng = n.exports, (j = oe).exports = function(e, n) {
      return Zs(e) || $s(e, n) || eg(e, n) || ng()
    }, j.exports.default = j.exports, j.exports.__esModule = !0, P(oe.exports)),
    og = (f({
      target: "Number",
      stat: !0
    }, {
      MAX_SAFE_INTEGER: 9007199254740991
    }), 9007199254740991),
    ig = Math.floor,
    k = Ws,
    I = se.match(/firefox\/(\d+)/i),
    c = !!I && +I[1],
    Un = /MSIE|Trident/.test(se),
    A = se.match(/AppleWebKit\/(\d+)\./),
    C = !!A && +A[1],
    Mn = f,
    ag = ze,
    rg = me,
    cg = Bn,
    lg = Wn,
    u = o,
    sg = k,
    Mo = hs,
    gg = c,
    fg = Un,
    hg = ge,
    pg = C,
    Ag = [],
    dg = Ag.sort,
    V = u(function() {
      Ag.sort(void 0)
    }),
    y = u(function() {
      Ag.sort(null)
    }),
    d = Mo("sort"),
    mg = !u(function() {
      if (hg) return hg < 70;
      if (!(gg && 3 < gg)) {
        if (fg) return !0;
        if (pg) return pg < 603;
        for (var e, n, t, o = "", i = 65; i < 76; i++) {
          switch (e = String.fromCharCode(i), i) {
            case 66:
            case 69:
            case 70:
            case 72:
              n = 3;
              break;
            case 68:
            case 71:
              n = 4;
              break;
            default:
              n = 2
          }
          for (t = 0; t < 47; t++) Ag.push({
            k: e + t,
            v: n
          })
        }
        for (Ag.sort(function(e, n) {
          return n.v - e.v
        }), t = 0; t < Ag.length; t++) e = Ag[t].k.charAt(0), o.charAt(o.length - 1) !== e && (o += e);
        return "DGBEFHACIJK" !== o
      }
    });
  Mn({
    target: "Array",
    proto: !0,
    forced: V || !y || !d || !mg
  }, {
    sort: function(e) {
      void 0 !== e && ag(e);
      var n = rg(this);
      if (mg) return void 0 === e ? dg.call(n) : dg.call(n, e);
      for (var t, o, i = [], a = cg(n.length), r = 0; r < a; r++) r in n && i.push(n[r]);
      for (t = (i = sg(i, (o = e, function(e, n) {
        return void 0 === n ? -1 : void 0 === e ? 1 : void 0 !== o ? +o(e, n) || 0 : lg(e) > lg(n) ? 1 : -1
      }))).length, r = 0; r < t;) n[r] = i[r++];
      for (; r < a;) delete n[r++];
      return n
    }
  });
  var ug = nl("Array").sort,
    bg = Array.prototype,
    kg = function(e) {
      var n = e.sort;
      return e === bg || e instanceof Array && n === bg.sort ? ug : n
    },
    jg = me,
    Ig = Kn,
    Eg = Bn;
  f({
    target: "Array",
    proto: !0
  }, {
    fill: function(e) {
      for (var n = jg(this), t = Eg(n.length), o = arguments.length, i = Ig(1 < o ? arguments[1] : void 0, t), o = 2 < o ? arguments[2] : void 0, a = void 0 === o ? t : Ig(o, t); i < a;) n[i++] = e;
      return n
    }
  });

  function Cg(s) {
    return function(e, n, t, o) {
      wg(n);
      var i = Qg(e),
        a = Sg(i),
        r = Tg(i.length),
        c = s ? r - 1 : 0,
        l = s ? -1 : 1;
      if (t < 2)
        for (;;) {
          if (c in a) {
            o = a[c], c += l;
            break
          }
          if (c += l, s ? c < 0 : r <= c) throw TypeError("Reduce of empty array with no initial value")
        }
      for (; s ? 0 <= c : c < r; c += l) c in a && (o = n(o, a[c], c, i));
      return o
    }
  }
  var vg = nl("Array").fill,
    yg = Array.prototype,
    Bg = function(e) {
      var n = e.fill;
      return e === yg || e instanceof Array && n === yg.fill ? vg : n
    },
    wg = ze,
    Qg = me,
    Sg = z,
    Tg = Bn,
    jo = f,
    Dg = {
      left: Cg(!1),
      right: Cg(!0)
    }.left,
    e = ge,
    xo = v;
  jo({
    target: "Array",
    proto: !0,
    forced: !hs("reduce") || !xo && 79 < e && e < 83
  }, {
    reduce: function(e) {
      return Dg(this, e, arguments.length, 1 < arguments.length ? arguments[1] : void 0)
    }
  });

  function _g(e, n, t, o, i, a, r, c) {
    for (var l, s = i, g = 0, f = !!r && Og(r, c, 3); g < o;) {
      if (g in t) {
        if (l = f ? f(t[g], g, n) : t[g], 0 < a && Pg(l)) s = _g(e, n, l, Ug(l.length), s, a - 1) - 1;
        else {
          if (9007199254740991 <= s) throw TypeError("Exceed the acceptable array length");
          e[s] = l
        }
        s++
      }
      g++
    }
    return s
  }
  var Rg = nl("Array").reduce,
    xg = Array.prototype,
    Ng = function(e) {
      var n = e.reduce;
      return e === xg || e instanceof Array && n === xg.reduce ? Rg : n
    },
    Pg = jn,
    Ug = Bn,
    Og = $e,
    Lg = _g,
    Mg = me,
    Fg = Bn,
    Gg = Cn,
    Jg = Rn;
  f({
    target: "Array",
    proto: !0
  }, {
    flat: function() {
      var e = arguments.length ? arguments[0] : void 0,
        n = Mg(this),
        t = Fg(n.length),
        o = Jg(n, 0);
      return o.length = Lg(o, n, n, t, 0, void 0 === e ? 1 : Gg(e)), o
    }
  });

  function Hg(n) {
    try {
      return decodeURIComponent(n)
    } catch (e) {
      return n
    }
  }

  function Yg(e) {
    return ih[e]
  }

  function qg(e) {
    return encodeURIComponent(e).replace(oh, Yg)
  }

  function Vg(e) {
    this.entries.length = 0, ah(this.entries, e)
  }

  function Wg(e, n) {
    if (e < n) throw TypeError("Not enough arguments")
  }

  function Kg() {
    Nf(this, Kg, Kf);
    var e, n, t, o, i, a, r, c, l = 0 < arguments.length ? arguments[0] : void 0,
      s = [];
    if (zf(this, {
      type: Kf,
      entries: s,
      updateURL: function() {},
      updateSearchParams: Vg
    }), void 0 !== l)
      if (Mf(l))
        if ("function" == typeof(e = Yf(l)))
          for (t = (n = Hf(l, e)).next; !(o = t.call(n)).done;) {
            if ((a = (i = (o = Hf(Lf(o.value))).next).call(o)).done || (r = i.call(o)).done || !i.call(o).done) throw TypeError("Expected sequence with length 2");
            s.push({
              key: Ff(a.value),
              value: Ff(r.value)
            })
          } else
          for (c in l) Pf(l, c) && s.push({
            key: c,
            value: Ff(l[c])
          });
      else ah(s, "string" == typeof l ? "?" === l.charAt(0) ? l.slice(1) : l : Ff(l))
  }

  function Xg(e) {
    var n, t, o, i;
    if ("number" == typeof e) {
      for (n = [], t = 0; t < 4; t++) n.unshift(e % 256), e = bh(e / 256);
      return n.join(".")
    }
    if ("object" != typeof e) return e;
    for (n = "", o = Ph(e), t = 0; t < 8; t++) i && 0 === e[t] || (i = i && !1, o === t ? (n += t ? ":" : "::", i = !0) : (n += e[t].toString(16), t < 7 && (n += ":")));
    return "[" + n + "]"
  }

  function zg(e) {
    return !e.host || e.cannotBeABaseURL || "file" == e.scheme
  }

  function Zg(e, n, t, o) {
    var i, a, r, c = t || Kh,
      l = 0,
      s = "",
      g = !1,
      f = !1,
      h = !1;
    for (t || (e.scheme = "", e.username = "", e.password = "", e.host = null, e.port = null, e.path = [], e.query = null, e.fragment = null, e.cannotBeABaseURL = !1, n = n.replace(Rh, "")), n = n.replace(xh, ""), i = gh(n); l <= i.length;) {
      switch (a = i[l], c) {
        case Kh:
          if (!a || !vh.test(a)) {
            if (t) return Ih;
            c = zh;
            continue
          }
          s += a.toLowerCase(), c = Xh;
          break;
        case Xh:
          if (a && (yh.test(a) || "+" == a || "-" == a || "." == a)) s += a.toLowerCase();
          else {
            if (":" != a) {
              if (t) return Ih;
              s = "", c = zh, l = 0;
              continue
            }
            if (t && (x(e) != sh(Gh, s) || "file" == s && (Jh(e) || null !== e.port) || "file" == e.scheme && !e.host)) return;
            if (e.scheme = s, t) return void(x(e) && Gh[e.scheme] == e.port && (e.port = null));
            s = "", "file" == e.scheme ? c = lp : x(e) && o && o.scheme == e.scheme ? c = Zh : x(e) ? c = tp : "/" == i[l + 1] ? (c = $h, l++) : (e.cannotBeABaseURL = !0, e.path.push(""), c = pp)
          }
          break;
        case zh:
          if (!o || o.cannotBeABaseURL && "#" != a) return Ih;
          if (o.cannotBeABaseURL && "#" == a) {
            e.scheme = o.scheme, e.path = o.path.slice(), e.query = o.query, e.fragment = "", e.cannotBeABaseURL = !0, c = dp;
            break
          }
          c = "file" == o.scheme ? lp : ep;
          continue;
        case Zh:
          if ("/" != a || "/" != i[l + 1]) {
            c = ep;
            continue
          }
          c = op, l++;
          break;
        case $h:
          if ("/" == a) {
            c = ip;
            break
          }
          c = hp;
          continue;
        case ep:
          if (e.scheme = o.scheme, a == of) e.username = o.username, e.password = o.password, e.host = o.host, e.port = o.port, e.path = o.path.slice(), e.query = o.query;
          else if ("/" == a || "\\" == a && x(e)) c = np;
          else if ("?" == a) e.username = o.username, e.password = o.password, e.host = o.host, e.port = o.port, e.path = o.path.slice(), e.query = "", c = Ap;
          else {
            if ("#" != a) {
              e.username = o.username, e.password = o.password, e.host = o.host, e.port = o.port, e.path = o.path.slice(), e.path.pop(), c = hp;
              continue
            }
            e.username = o.username, e.password = o.password, e.host = o.host, e.port = o.port, e.path = o.path.slice(), e.query = o.query, e.fragment = "", c = dp
          }
          break;
        case np:
          if (!x(e) || "/" != a && "\\" != a) {
            if ("/" != a) {
              e.username = o.username, e.password = o.password, e.host = o.host, e.port = o.port, c = hp;
              continue
            }
            c = ip
          } else c = op;
          break;
        case tp:
          if (c = op, "/" != a || "/" != s.charAt(l + 1)) continue;
          l++;
          break;
        case op:
          if ("/" == a || "\\" == a) break;
          c = ip;
          continue;
        case ip:
          if ("@" == a) {
            g && (s = "%40" + s);
            for (var g = !0, p = gh(s), A = 0; A < p.length; A++) {
              var d = p[A];
              ":" != d || h ? (d = Fh(d, Mh), h ? e.password += d : e.username += d) : h = !0
            }
            s = ""
          } else if (a == of || "/" == a || "?" == a || "#" == a || "\\" == a && x(e)) {
            if (g && "" == s) return jh;
            l -= gh(s).length + 1, s = "", c = ap
          } else s += a;
          break;
        case ap:
        case rp:
          if (t && "file" == e.scheme) {
            c = gp;
            continue
          }
          if (":" != a || f) {
            if (a == of || "/" == a || "?" == a || "#" == a || "\\" == a && x(e)) {
              if (x(e) && "" == s) return Eh;
              if (t && "" == s && (Jh(e) || null !== e.port)) return;
              if (r = Nh(e, s)) return r;
              if (s = "", c = fp, t) return;
              continue
            }
            "[" == a ? f = !0 : "]" == a && (f = !1), s += a
          } else {
            if ("" == s) return Eh;
            if (r = Nh(e, s)) return r;
            if (s = "", c = cp, t == rp) return
          }
          break;
        case cp:
          if (!Bh.test(a)) {
            if (a == of || "/" == a || "?" == a || "#" == a || "\\" == a && x(e) || t) {
              if ("" != s) {
                var m = parseInt(s, 10);
                if (65535 < m) return Ch;
                e.port = x(e) && m === Gh[e.scheme] ? null : m, s = ""
              }
              if (t) return;
              c = fp;
              continue
            }
            return Ch
          }
          s += a;
          break;
        case lp:
          if (e.scheme = "file", "/" == a || "\\" == a) c = sp;
          else {
            if (!o || "file" != o.scheme) {
              c = hp;
              continue
            }
            if (a == of) e.host = o.host, e.path = o.path.slice(), e.query = o.query;
            else if ("?" == a) e.host = o.host, e.path = o.path.slice(), e.query = "", c = Ap;
            else {
              if ("#" != a) {
                Yh(i.slice(l).join("")) || (e.host = o.host, e.path = o.path.slice(), qh(e)), c = hp;
                continue
              }
              e.host = o.host, e.path = o.path.slice(), e.query = o.query, e.fragment = "", c = dp
            }
          }
          break;
        case sp:
          if ("/" == a || "\\" == a) {
            c = gp;
            break
          }
          o && "file" == o.scheme && !Yh(i.slice(l).join("")) && (Hh(o.path[0], !0) ? e.path.push(o.path[0]) : e.host = o.host), c = hp;
          continue;
        case gp:
          if (a == of || "/" == a || "\\" == a || "?" == a || "#" == a) {
            if (!t && Hh(s)) c = hp;
            else if ("" == s) {
              if (e.host = "", t) return;
              c = fp
            } else {
              if (r = Nh(e, s)) return r;
              if ("localhost" == e.host && (e.host = ""), t) return;
              s = "", c = fp
            }
            continue
          }
          s += a;
          break;
        case fp:
          if (x(e)) {
            if (c = hp, "/" != a && "\\" != a) continue
          } else if (t || "?" != a)
            if (t || "#" != a) {
              if (a != of && (c = hp, "/" != a)) continue
            } else e.fragment = "", c = dp;
          else e.query = "", c = Ap;
          break;
        case hp:
          if (a == of || "/" == a || "\\" == a && x(e) || !t && ("?" == a || "#" == a)) {
            if (Wh(s) ? (qh(e), "/" == a || "\\" == a && x(e) || e.path.push("")) : Vh(s) ? "/" == a || "\\" == a && x(e) || e.path.push("") : ("file" == e.scheme && !e.path.length && Hh(s) && (e.host && (e.host = ""), s = s.charAt(0) + ":"), e.path.push(s)), s = "", "file" == e.scheme && (a == of || "?" == a || "#" == a))
              for (; 1 < e.path.length && "" === e.path[0];) e.path.shift();
            "?" == a ? (e.query = "", c = Ap) : "#" == a && (e.fragment = "", c = dp)
          } else s += Fh(a, Lh);
          break;
        case pp:
          "?" == a ? (e.query = "", c = Ap) : "#" == a ? (e.fragment = "", c = dp) : a != of && (e.path[0] += Fh(a, Uh));
          break;
        case Ap:
          t || "#" != a ? a != of && ("'" == a && x(e) ? e.query += "%27" : e.query += "#" == a ? "%23" : Fh(a, Uh)) : (e.fragment = "", c = dp);
          break;
        case dp:
          a != of && (e.fragment += Fh(a, Oh))
      }
      l++
    }
  }

  function $g(e) {
    var n, t, o = lh(this, $g, "URL"),
      i = 1 < arguments.length ? arguments[1] : void 0,
      e = ph(e),
      a = uh(o, {
        type: "URL"
      });
    if (void 0 !== i)
      if (i instanceof $g) n = R(i);
      else if (t = Zg(n = {}, ph(i))) throw TypeError(t);
    if (t = Zg(a, e, null, n)) throw TypeError(t);
    var r = a.searchParams = new dh;
    (i = mh(r)).updateSearchParams(a.query), i.updateURL = function() {
      a.query = String(r) || null
    }, ch || (o.href = mp.call(o), o.origin = up.call(o), o.protocol = bp.call(o), o.username = kp.call(o), o.password = jp.call(o), o.host = Ip.call(o), o.hostname = Ep.call(o), o.port = Cp.call(o), o.pathname = vp.call(o), o.search = yp.call(o), o.searchParams = Bp.call(o), o.hash = wp.call(o))
  }

  function ef(e, n) {
    return {
      get: e,
      set: n,
      configurable: !0,
      enumerable: !0
    }
  }
  var nf, tf, of, af, rf, cf = nl("Array").flat,
    lf = Array.prototype,
    sf = function(e) {
      var n = e.flat;
      return e === lf || e instanceof Array && n === lf.flat ? cf : n
    },
    m = o,
    gf = h("iterator"),
    Tn = !m(function() {
      var e = new URL("b?a=1&b=2&c=3", "http://a"),
        t = e.searchParams,
        o = "";
      return e.pathname = "c%20d", t.forEach(function(e, n) {
        t.delete("b"), o += n + e
      }), !e.toJSON || !t.sort || "http://a/c%20d?a=1&c=3" !== e.href || "3" !== t.get("c") || "a=1" !== String(new URLSearchParams("?a=1")) || !t[gf] || "a" !== new URL("https://a@b").username || "b" !== new URLSearchParams(new URLSearchParams("a=b")).get("a") || "xn--e1aybc" !== new URL("http://тест").host || "#%D0%B1" !== new URL("http://a#б").hash || "a1c3" !== o || "x" !== new URL("http://x", void 0).host
    }),
    ff = i,
    Go = o,
    hf = At,
    pf = Xn,
    Af = q,
    df = me,
    mf = z,
    uf = Object.assign,
    bf = Object.defineProperty,
    r = !uf || Go(function() {
      if (ff && 1 !== uf({
        b: 1
      }, uf(bf({}, "a", {
        enumerable: !0,
        get: function() {
          bf(this, "b", {
            value: 3,
            enumerable: !1
          })
        }
      }), {
        b: 2
      })).b) return !0;
      var e = {},
        n = {},
        t = Symbol(),
        o = "abcdefghijklmnopqrst";
      return e[t] = 7, o.split("").forEach(function(e) {
        n[e] = e
      }), 7 != uf({}, e)[t] || hf(uf({}, n)).join("") != o
    }) ? function(e, n) {
      for (var t = df(e), o = arguments.length, i = 1, a = pf.f, r = Af.f; i < o;)
        for (var c, l = mf(arguments[i++]), s = a ? hf(l).concat(a(l)) : hf(l), g = s.length, f = 0; f < g;) c = s[f++], ff && !r.call(l, c) || (t[c] = l[c]);
      return t
    } : uf,
    kf = 2147483647,
    jf = 36,
    If = 1,
    Ef = 26,
    Cf = 72,
    vf = 128,
    yf = "-",
    Bf = /[^\0-\u007E]/,
    wf = /[.\u3002\uFF0E\uFF61]/g,
    Qf = "Overflow: input needs wider integers to process",
    Sf = jf - If,
    Tf = Math.floor,
    Df = String.fromCharCode,
    _f = function(e) {
      for (var n = [], t = 0, o = e.length; t < o;) {
        var i, a = e.charCodeAt(t++);
        55296 <= a && a <= 56319 && t < o ? 56320 == (64512 & (i = e.charCodeAt(t++))) ? n.push(((1023 & a) << 10) + (1023 & i) + 65536) : (n.push(a), t--) : n.push(a)
      }
      return n
    },
    Rf = function(e) {
      return e + 22 + 75 * (e < 26)
    },
    xf = function(e, n, t) {
      var o = 0;
      for (e = t ? Tf(e / 700) : e >> 1, e += Tf(e / n); Sf * Ef >> 1 < e; o += jf) e = Tf(e / Sf);
      return Tf(o + (1 + Sf) * e / (e + 38))
    },
    ee = f,
    b = le,
    p = Tn,
    g = Gt,
    Ro = Ga,
    No = Vt,
    n = Ai,
    j = ro,
    Nf = Ha,
    Pf = de,
    Uf = $e,
    Of = Kt,
    Lf = tn,
    Mf = a,
    Ff = Wn,
    Gf = wt,
    Jf = K,
    Hf = da,
    Yf = Aa,
    oe = h,
    qf = b("fetch"),
    Vf = b("Request"),
    I = Vf && Vf.prototype,
    Wf = b("Headers"),
    se = oe("iterator"),
    Kf = "URLSearchParams",
    Xf = Kf + "Iterator",
    zf = j.set,
    Zf = j.getterFor(Kf),
    $f = j.getterFor(Xf),
    eh = /\+/g,
    nh = Array(4),
    th = function(e) {
      var n, t = e.replace(eh, " "),
        o = 4;
      try {
        return decodeURIComponent(t)
      } catch (e) {
        for (; o;) t = t.replace((n = o--, nh[n - 1] || (nh[n - 1] = RegExp("((?:%[\\da-f]{2}){" + n + "})", "gi"))), Hg);
        return t
      }
    },
    oh = /[!'()~]|%20/g,
    ih = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+"
    },
    ah = function(e, n) {
      if (n)
        for (var t, o = n.split("&"), i = 0; i < o.length;)(t = o[i++]).length && (t = t.split("="), e.push({
          key: th(t.shift()),
          value: th(t.join("="))
        }))
    },
    rh = n(function(e, n) {
      zf(this, {
        type: Xf,
        iterator: Hf(Zf(e).entries),
        kind: n
      })
    }, "Iterator", function() {
      var e = $f(this),
        n = e.kind,
        e = e.iterator.next(),
        t = e.value;
      return e.done || (e.value = "keys" === n ? t.key : "values" === n ? t.value : [t.key, t.value]), e
    }),
    A = Kg.prototype,
    k = (Ro(A, {
      append: function(e, n) {
        Wg(arguments.length, 2);
        var t = Zf(this);
        t.entries.push({
          key: Ff(e),
          value: Ff(n)
        }), t.updateURL()
      },
      delete: function(e) {
        Wg(arguments.length, 1);
        for (var n = Zf(this), t = n.entries, o = Ff(e), i = 0; i < t.length;) t[i].key === o ? t.splice(i, 1) : i++;
        n.updateURL()
      },
      get: function(e) {
        Wg(arguments.length, 1);
        for (var n = Zf(this).entries, t = Ff(e), o = 0; o < n.length; o++)
          if (n[o].key === t) return n[o].value;
        return null
      },
      getAll: function(e) {
        Wg(arguments.length, 1);
        for (var n = Zf(this).entries, t = Ff(e), o = [], i = 0; i < n.length; i++) n[i].key === t && o.push(n[i].value);
        return o
      },
      has: function(e) {
        Wg(arguments.length, 1);
        for (var n = Zf(this).entries, t = Ff(e), o = 0; o < n.length;)
          if (n[o++].key === t) return !0;
        return !1
      },
      set: function(e, n) {
        Wg(arguments.length, 1);
        for (var t, o = Zf(this), i = o.entries, a = !1, r = Ff(e), c = Ff(n), l = 0; l < i.length; l++)(t = i[l]).key === r && (a ? i.splice(l--, 1) : (a = !0, t.value = c));
        a || i.push({
          key: r,
          value: c
        }), o.updateURL()
      },
      sort: function() {
        for (var e, n, t = Zf(this), o = t.entries, i = o.slice(), a = o.length = 0; a < i.length; a++) {
          for (e = i[a], n = 0; n < a; n++)
            if (o[n].key > e.key) {
              o.splice(n, 0, e);
              break
            } n === a && o.push(e)
        }
        t.updateURL()
      },
      forEach: function(e) {
        for (var n, t = Zf(this).entries, o = Uf(e, 1 < arguments.length ? arguments[1] : void 0, 3), i = 0; i < t.length;) o((n = t[i++]).value, n.key, this)
      },
      keys: function() {
        return new rh(this, "keys")
      },
      values: function() {
        return new rh(this, "values")
      },
      entries: function() {
        return new rh(this, "entries")
      }
    }, {
      enumerable: !0
    }), g(A, se, A.entries), g(A, "toString", function() {
      for (var e, n = Zf(this).entries, t = [], o = 0; o < n.length;) e = n[o++], t.push(qg(e.key) + "=" + qg(e.value));
      return t.join("&")
    }, {
      enumerable: !0
    }), No(Kg, Kf), ee({
      global: !0,
      forced: !p
    }, {
      URLSearchParams: Kg
    }), p || "function" != typeof Wf || (nf = function(e) {
      if (Mf(e)) {
        var n, t = e.body;
        if (Of(t) === Kf) return (n = e.headers ? new Wf(e.headers) : new Wf).has("content-type") || n.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), Gf(e, {
          body: Jf(0, String(t)),
          headers: Jf(0, n)
        })
      }
      return e
    }, "function" == typeof qf && ee({
      global: !0,
      enumerable: !0,
      forced: !0
    }, {
      fetch: function(e) {
        return qf(e, 1 < arguments.length ? nf(arguments[1]) : {})
      }
    }), "function" == typeof Vf && ((I.constructor = tf = function(e) {
      return Nf(this, tf, "Request"), new Vf(e, 1 < arguments.length ? nf(arguments[1]) : {})
    }).prototype = I, ee({
      global: !0,
      forced: !0
    }, {
      Request: tf
    }))), {
      URLSearchParams: Kg,
      getState: Zf
    }),
    c = f,
    ch = i,
    Un = Tn,
    C = dt,
    Mo = Gt,
    lh = Ha,
    sh = de,
    u = r,
    gh = xs,
    fh = Po.codeAt,
    hh = function(e) {
      for (var n, t = [], o = e.toLowerCase().replace(wf, ".").split("."), i = 0; i < o.length; i++) n = o[i], t.push(Bf.test(n) ? "xn--" + function(e) {
        var n, t = [],
          o = (e = _f(e)).length,
          i = vf,
          a = 0,
          r = Cf;
        for (g = 0; g < e.length; g++)(n = e[g]) < 128 && t.push(Df(n));
        var c = t.length,
          l = c;
        for (c && t.push(yf); l < o;) {
          for (var s = kf, g = 0; g < e.length; g++) i <= (n = e[g]) && n < s && (s = n);
          var f = l + 1;
          if (s - i > Tf((kf - a) / f)) throw RangeError(Qf);
          for (a += (s - i) * f, i = s, g = 0; g < e.length; g++) {
            if ((n = e[g]) < i && ++a > kf) throw RangeError(Qf);
            if (n == i) {
              for (var h = a, p = jf;; p += jf) {
                var A = p <= r ? If : r + Ef <= p ? Ef : p - r;
                if (h < A) break;
                var d = h - A,
                  m = jf - A;
                t.push(Df(Rf(A + d % m))), h = Tf(d / m)
              }
              t.push(Df(Rf(h))), r = xf(a, f, l == c), a = 0, ++l
            }
          }++a, ++i
        }
        return t.join("")
      }(n) : n);
      return t.join(".")
    },
    ph = Wn,
    Mn = Vt,
    V = ro,
    Ah = t.URL,
    dh = k.URLSearchParams,
    mh = k.getState,
    uh = V.set,
    R = V.getterFor("URL"),
    bh = Math.floor,
    kh = Math.pow,
    jh = "Invalid authority",
    Ih = "Invalid scheme",
    Eh = "Invalid host",
    Ch = "Invalid port",
    vh = /[A-Za-z]/,
    yh = /[\d+-.A-Za-z]/,
    Bh = /\d/,
    wh = /^0x/i,
    Qh = /^[0-7]+$/,
    Sh = /^\d+$/,
    Th = /^[\dA-Fa-f]+$/,
    Dh = /[\0\t\n\r #%/:<>?@[\\\]^|]/,
    _h = /[\0\t\n\r #/:<>?@[\\\]^|]/,
    Rh = /^[\u0000-\u0020]+|[\u0000-\u0020]+$/g,
    xh = /[\t\n\r]/g,
    Nh = function(e, n) {
      var t, o, i;
      if ("[" == n.charAt(0)) return "]" == n.charAt(n.length - 1) && (t = function(e) {
        var n = [0, 0, 0, 0, 0, 0, 0, 0],
          t = 0,
          o = null,
          i = 0,
          a, r, c, l, s, g, f, h = function() {
            return e.charAt(i)
          };
        if (h() == ":") {
          if (e.charAt(1) != ":") return;
          i += 2;
          t++;
          o = t
        }
        while (h()) {
          if (t == 8) return;
          if (h() == ":") {
            if (o !== null) return;
            i++;
            t++;
            o = t;
            continue
          }
          a = r = 0;
          while (r < 4 && Th.test(h())) {
            a = a * 16 + parseInt(h(), 16);
            i++;
            r++
          }
          if (h() == ".") {
            if (r == 0) return;
            i -= r;
            if (t > 6) return;
            c = 0;
            while (h()) {
              l = null;
              if (c > 0)
                if (h() == "." && c < 4) i++;
                else return;
              if (!Bh.test(h())) return;
              while (Bh.test(h())) {
                s = parseInt(h(), 10);
                if (l === null) l = s;
                else if (l == 0) return;
                else l = l * 10 + s;
                if (l > 255) return;
                i++
              }
              n[t] = n[t] * 256 + l;
              c++;
              if (c == 2 || c == 4) t++
            }
            if (c != 4) return;
            break
          } else if (h() == ":") {
            i++;
            if (!h()) return
          } else if (h()) return;
          n[t++] = a
        }
        if (o !== null) {
          g = t - o;
          t = 7;
          while (t != 0 && g > 0) {
            f = n[t];
            n[t--] = n[o + g - 1];
            n[o + --g] = f
          }
        } else if (t != 8) return;
        return n
      }(n.slice(1, -1))) ? void(e.host = t) : Eh;
      if (x(e)) return n = hh(n), Dh.test(n) || null === (t = function(e) {
        var n = e.split("."),
          t, o, i, a, r, c, l;
        if (n.length && n[n.length - 1] == "") n.pop();
        if ((t = n.length) > 4) return e;
        for (o = [], i = 0; i < t; i++) {
          a = n[i];
          if (a == "") return e;
          r = 10;
          if (a.length > 1 && a.charAt(0) == "0") {
            r = wh.test(a) ? 16 : 8;
            a = a.slice(r == 8 ? 1 : 2)
          }
          if (a === "") c = 0;
          else {
            if (!(r == 10 ? Sh : r == 8 ? Qh : Th).test(a)) return e;
            c = parseInt(a, r)
          }
          o.push(c)
        }
        for (i = 0; i < t; i++) {
          c = o[i];
          if (i == t - 1) {
            if (c >= kh(256, 5 - t)) return null
          } else if (c > 255) return null
        }
        for (l = o.pop(), i = 0; i < o.length; i++) l += o[i] * kh(256, 3 - i);
        return l
      }(n)) ? Eh : void(e.host = t);
      if (_h.test(n)) return Eh;
      for (t = "", o = gh(n), i = 0; i < o.length; i++) t += Fh(o[i], Uh);
      e.host = t
    },
    Ph = function(e) {
      for (var n = null, t = 1, o = null, i = 0, a = 0; a < 8; a++) 0 !== e[a] ? (t < i && (n = o, t = i), o = null, i = 0) : (null === o && (o = a), ++i);
      return t < i && (n = o, t = i), n
    },
    Uh = {},
    Oh = u({}, Uh, {
      " ": 1,
      '"': 1,
      "<": 1,
      ">": 1,
      "`": 1
    }),
    Lh = u({}, Oh, {
      "#": 1,
      "?": 1,
      "{": 1,
      "}": 1
    }),
    Mh = u({}, Lh, {
      "/": 1,
      ":": 1,
      ";": 1,
      "=": 1,
      "@": 1,
      "[": 1,
      "\\": 1,
      "]": 1,
      "^": 1,
      "|": 1
    }),
    Fh = function(e, n) {
      var t = fh(e, 0);
      return 32 < t && t < 127 && !sh(n, e) ? e : encodeURIComponent(e)
    },
    Gh = {
      ftp: 21,
      file: null,
      http: 80,
      https: 443,
      ws: 80,
      wss: 443
    },
    x = function(e) {
      return sh(Gh, e.scheme)
    },
    Jh = function(e) {
      return "" != e.username || "" != e.password
    },
    Hh = function(e, n) {
      return 2 == e.length && vh.test(e.charAt(0)) && (":" == (e = e.charAt(1)) || !n && "|" == e)
    },
    Yh = function(e) {
      return 1 < e.length && Hh(e.slice(0, 2)) && (2 == e.length || "/" === (e = e.charAt(2)) || "\\" === e || "?" === e || "#" === e)
    },
    qh = function(e) {
      var n = e.path,
        t = n.length;
      !t || "file" == e.scheme && 1 == t && Hh(n[0], !0) || n.pop()
    },
    Vh = function(e) {
      return "." === e || "%2e" === e.toLowerCase()
    },
    Wh = function(e) {
      return ".." === (e = e.toLowerCase()) || "%2e." === e || ".%2e" === e || "%2e%2e" === e
    },
    Kh = {},
    Xh = {},
    zh = {},
    Zh = {},
    $h = {},
    ep = {},
    np = {},
    tp = {},
    op = {},
    ip = {},
    ap = {},
    rp = {},
    cp = {},
    lp = {},
    sp = {},
    gp = {},
    fp = {},
    hp = {},
    pp = {},
    Ap = {},
    dp = {},
    y = $g.prototype,
    mp = function() {
      var e = R(this),
        n = e.scheme,
        t = e.username,
        o = e.password,
        i = e.host,
        a = e.port,
        r = e.path,
        c = e.query,
        l = e.fragment,
        s = n + ":";
      return null !== i ? (s += "//", Jh(e) && (s += t + (o ? ":" + o : "") + "@"), s += Xg(i), null !== a && (s += ":" + a)) : "file" == n && (s += "//"), s += e.cannotBeABaseURL ? r[0] : r.length ? "/" + r.join("/") : "", null !== c && (s += "?" + c), null !== l && (s += "#" + l), s
    },
    up = function() {
      var e = R(this),
        n = e.scheme,
        t = e.port;
      if ("blob" == n) try {
        return new $g(n.path[0]).origin
      } catch (e) {
        return "null"
      }
      return "file" != n && x(e) ? n + "://" + Xg(e.host) + (null !== t ? ":" + t : "") : "null"
    },
    bp = function() {
      return R(this).scheme + ":"
    },
    kp = function() {
      return R(this).username
    },
    jp = function() {
      return R(this).password
    },
    Ip = function() {
      var e = R(this),
        n = e.host,
        e = e.port;
      return null === n ? "" : null === e ? Xg(n) : Xg(n) + ":" + e
    },
    Ep = function() {
      var e = R(this).host;
      return null === e ? "" : Xg(e)
    },
    Cp = function() {
      var e = R(this).port;
      return null === e ? "" : String(e)
    },
    vp = function() {
      var e = R(this),
        n = e.path;
      return e.cannotBeABaseURL ? n[0] : n.length ? "/" + n.join("/") : ""
    },
    yp = function() {
      var e = R(this).query;
      return e ? "?" + e : ""
    },
    Bp = function() {
      return R(this).searchParams
    },
    wp = function() {
      var e = R(this).fragment;
      return e ? "#" + e : ""
    };
  ch && C(y, {
    href: ef(mp, function(e) {
      var n = R(this),
        e = ph(e),
        e = Zg(n, e);
      if (e) throw TypeError(e);
      mh(n.searchParams).updateSearchParams(n.query)
    }),
    origin: ef(up),
    protocol: ef(bp, function(e) {
      var n = R(this);
      Zg(n, ph(e) + ":", Kh)
    }),
    username: ef(kp, function(e) {
      var n = R(this),
        t = gh(ph(e));
      if (!zg(n)) {
        n.username = "";
        for (var o = 0; o < t.length; o++) n.username += Fh(t[o], Mh)
      }
    }),
    password: ef(jp, function(e) {
      var n = R(this),
        t = gh(ph(e));
      if (!zg(n)) {
        n.password = "";
        for (var o = 0; o < t.length; o++) n.password += Fh(t[o], Mh)
      }
    }),
    host: ef(Ip, function(e) {
      var n = R(this);
      n.cannotBeABaseURL || Zg(n, ph(e), ap)
    }),
    hostname: ef(Ep, function(e) {
      var n = R(this);
      n.cannotBeABaseURL || Zg(n, ph(e), rp)
    }),
    port: ef(Cp, function(e) {
      var n = R(this);
      zg(n) || ("" == (e = ph(e)) ? n.port = null : Zg(n, e, cp))
    }),
    pathname: ef(vp, function(e) {
      var n = R(this);
      n.cannotBeABaseURL || (n.path = [], Zg(n, ph(e), fp))
    }),
    search: ef(yp, function(e) {
      var n = R(this);
      "" == (e = ph(e)) ? n.query = null: ("?" == e.charAt(0) && (e = e.slice(1)), n.query = "", Zg(n, e, Ap)), mh(n.searchParams).updateSearchParams(n.query)
    }),
    searchParams: ef(Bp),
    hash: ef(wp, function(e) {
      var n = R(this);
      "" == (e = ph(e)) ? n.fragment = null: ("#" == e.charAt(0) && (e = e.slice(1)), n.fragment = "", Zg(n, e, dp))
    })
  }), Mo(y, "toJSON", function() {
    return mp.call(this)
  }, {
    enumerable: !0
  }), Mo(y, "toString", function() {
    return mp.call(this)
  }, {
    enumerable: !0
  }), Ah && (af = Ah.createObjectURL, rf = Ah.revokeObjectURL, af && Mo($g, "createObjectURL", function(e) {
    return af.apply(Ah, arguments)
  }), rf && Mo($g, "revokeObjectURL", function(e) {
    return rf.apply(Ah, arguments)
  })), Mn($g, "URL"), c({
    global: !0,
    forced: !Un,
    sham: !ch
  }, {
    URL: $g
  });
  var Qp = ie.URL,
    Sp = [".Al Bayan PUA", ".Al Nile PUA", ".SF NS Rounded", "ADOBE GARAMOND PRO", "AMGDT", "AR PL UKai HK", "AR PL UKai TW", "AR PL UKai TW MBE", "AR PL UMing CN", "AR PL UMing HK", "AR PL UMing TW", "AR PL UMing TW MBE", "ARCHER", "AVENIR", "Abadi MT Condensed Light", "Abyssinica SIL", "AcadEref", "Adobe Devanagari", "Adobe Fan Heiti Std B", "Adobe Garamond Pro", "Adobe Kaiti Std R", "Aharoni", "Aharoni Bold", "Aharoni CLM", "Al Bayan Bold", "Al Bayan Plain", "AlBattar", "AlManzomah", "Albertus Extra Bold", "Aldhabi", "Alexandra Script", "Algerian", "Amadeus", "Amazone BT", "AmdtSymbols", "AmerType Md BT", "American Typewriter", "Amiri Quran", "AnastasiaScript", "Andika", "Android Emoji", "Angsana New", "Angsana New Bold Italic", "Angsana New Italic", "AngsanaUPC", "AngsanaUPC Bold Italic", "AngsanaUPC Italic", "Ani", "Antique Olive", "Aparajita", "Aparajita Italic", "Apple LiGothic Medium", "Apple LiSung", "Apple SD Gothic Neo", "Arabic Typesetting", "Arial Baltic", "Arial Nova Bold", "Arial Nova Bold Italic", "Arial Nova Cond", "Arial Nova Cond Bold Italic", "Arial Nova Cond Light Italic", "Arimo", "Ariston", "Arno Pro Caption", "Arno Pro Display", "Arno Pro Light Display", "Arno Pro Smbd", "Arno Pro Subhead", "Arrus BT", "AvantGarde Bk BT", "AvantGarde Md BT", "Avenir", "Avenir Next Condensed Regular", "Avenir Next Demi Bold", "Avenir Next DemiBoldItalic", "Avenir Next Heavy", "BIZ UDGothic Bold", "BIZ UDMincho", "BPG Courier S GPL&GNU", "BPG Excelsior Condencerd GPL&GNU", "BankGothic Lt BT", "Baskerville Bold", "Bell Gothic Std Light", "Bell MT", "Berlin Sans FB", "BernhardMod BT", "BiauKai", "Bickham Script Pro Semibold", "Bickham Script Two", "Big Caslon", "Bitstream Vera Sans Mono", "Blackadder ITC", "Britannic Bold", "Browallia New Bold Italic", "Browallia New Italic", "BrowalliaUPC", "BrowalliaUPC Bold Italic", "Caladings CLM", "Californian FB", "Calligrapher", "Cambria", "Cambria Italic", "Cambria Math", "Candara Italic", "Cantarell Extra Bold", "Carlito", "Castellar", "Ceremonious Two", "Charter Black", "ChelthmITC Bk BT", "Chilanka", "Clarendon BT", "Clarendon Blk BT", "Clarendon Lt BT", "Cochin", "Comfortaa Light", "Comic Sans", "Cordia New Bold Italic", "Cordia New Italic", "CordiaUPC Bold Italic", "CordiaUPC Italic", "Cornerstone", "Corsiva Hebrew", "Curlz MT", "DIN Alternate", "David", "DecoType Naskh Regular", "Decor", "DejaVu Sans", "DengXian Bold", "DengXian Light", "DilleniaUPC Bold Italic", "Diwan Kufi", "Droid Arabic Naskh", "Droid Naskh Shift Alt", "Droid Sans Arabic", "Droid Sans Devanagari", "Droid Sans Georgian", "Droid Sans Japanese", "Droid Sans Tamil", "Drugulin CLM", "Ebrima", "Edwardian Script ITC", "Engravers MT", "Exotc350 Bd BT", "Ezra SIL SR", "FangSong", "Fixedsys", "FontAwesome", "Footlight MT Light", "Free Chancery", "FreeMono", "Futura Md BT", "GB18030 Bitmap", "GOTHAM BOLD", "Gayathri", "Gentium Basic", "GeoSlab 703 Lt BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "Georgia Pro Cond", "Georgia Pro Cond Light Italic", "Georgia Pro Cond Semibold Italic", "Gill Sans SemiBold", "Gill Sans Ultra Bold Condensed", "Gill Sans UltraBold", "Granada", "Hannotate TC Regular", "HanziPen SC", "Hershey-Gothic-Italian", "High Tower Text", "Hor", "Ink Free", "Kaiti TC Regular", "Kozuka Gothic Pr6N B", "Leelawadee", "Leelawadee Bold", "Letter Gothic Std", "LingWai TC", "Linux Biolinum O", "Lithos Pro Regular", "Lohit Tamil", "MONO", "Malgun Gothic Semilight", "Marion", "Matura MT Script Capitals", "Montserrat Alternates", "Montserrat Black", "Mshtakan Bold", "Myriad Arabic", "NEVIS", "NanumGothicCoding", "NanumGothicExtraBold", "NanumSquare", "NanumSquareRound", "Narkisim", "New Peninim MT", "News GothicMT", "Nimbus Sans", "Nimbus Sans Narrow", "Noto Naskh Arabic", "Noto Sans Adlam", "Noto Sans Anatolian Hieroglyphs", "Noto Sans CJK HK Light", "Noto Sans CJK JP Medium", "Noto Sans CJK JP Thin", "Noto Sans CJK KR", "Noto Sans CJK KR Medium", "Noto Sans CJK SC", "Noto Sans CJK SC Light", "Noto Sans CJK SC Medium", "Noto Sans CJK SC Thin", "Noto Sans Devanagari", "Noto Sans Duployan", "Noto Sans Gujarati", "Noto Sans Mono CJK HK", "Noto Sans Old Italic", "Noto Serif Ahom", "Noto Serif CJK KR Medium", "Noto Serif CJK TC", "Noto Serif CJK TC Medium", "Noto Serif Khmer", "Ouverture script", "PakTypeNaqsh", "Playbill", "Quicksand Light", "Roboto Condensed", "STFangsong", "STIX Math", "STIX Two Text", "STIX Two Text Bold", "Segoe UI Bold Italic", "Serifa Th BT", "Sherwood", "Sitka Small Italic", "Source Code Pro Black", "Source Han Sans CN Bold", "Source Han Sans CN ExtraLight", "Source Han Serif TW", "Square721 BT", "Stam Ashkenaz CLM", "Standard Symbols PS", "Tlwg Mono", "URW Palladio L", "Ubuntu", "Ubuntu Condensed", "Ubuntu Thin", "Univers CE 55 Medium", "WP MultinationalA Roman", "WP MultinationalB Roman", "WenQuanYi Zen Hei", "Yu Mincho Demibold", "Zapf Dingbats ITC", "aakar", "msam10", "Droid Sans Mono Dotted for Powerline", "Lucida Bright Demibold", "News Gothic MT Bold"],
    Tp = ["oocalimimngaihdkbihfgmpkcpnmlaoa/lib/tp_emoji/emoji-picker.json", "eofcbnmajmjmplflapaojjnihcjkigck/common/ui/css/extension.css", "bmnlcjabgnpnenekpadlanbbkooimhnj/paypal/meta.js", "kbfnbcaeplbcioakkpcpgfkobkghlhen/src/fonts/0cde50f90fe61871de0af0d24e4d6f6b/extension-inter-light.woff", "gighmmpiobklfepjocnamgkkbiglidom/adblock-uiscripts-adblock-wizard.css", "aapbdbdomjkkjkaonfhkkikfgjllcleb/popup_css_compiled.css", "hdokiejnpimakedhajhdlcegeplioahd/overlay.html", "gomekmidlodglbbmalcneegieacbdmki/common/mocks/empty.js", "efaidnbmnnnibpcajpcglclefindmkaj/viewer.html", "jlhmfgmfgeifomenelglieieghnjghma/cwcsf-nativemsg-iframe-43c85c0d-d633-af5e-c056-32dc7efc570b.html", "ihcjicgdanjaechkgeegckofjjedodee/app/assets/close-icon.svg", "jjkchpdmjjdmalgembblgafllbpcjlei/Resources/mcafee.gif", "gpdjojdkbbmdfjfahjcgigfpmkopogic/html/save.html", "pbjikboenpfhbbejgkoklgkhjpfogcam/static/html/cookieProxy.html", "lifbcibllhkdhoafpjfnlhfpfgnpldfl/assets/fonts/SkypeAssets-Light.woff", "kgjfgplpablkjnlkjmjdecgdpfankdle/images/loading_24.gif", "bihmplhobchoageeokmgbdihknkjbknd/static/assets/flags/br.svg", "mmeijimgabbpbgpdklnllpncmdofkcpn/cam-frame.html", "nenlahapcbofgnanklpelkaejcehkggg/GENERATED/analytics.js", "glcimepnljoholdmjchkloafkggfoijh/images/360ts_promo.png", "bkdgflcldnnnapblkhphbgpggdiikppg/img/logo-small.svg", "ogdlpmhglpejoiomcodnpjnfgcpmgale/assets/favicon.ico", "nckgahadagoaajjgafhacjanaoiihapd/_locales/am/messages.json", "lpcaedmchfhocbbapmcbpinfpgnhiddi/index.html", "flliilndjeohchalpbbcdekjklbdgfkk/html/top.html", "fdpohaocaechififmbbbbbknoalclacl/p/_api.html", "hehijbfgiekmjfkfjpbkbammjbdenadd/js/extapi_wp.js", "iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js", "liecbddmkiiihnedobmlmillhodjkdmb/css/content.css", "ccbpbkebodcjkknkfkpmfeciinhidaeh/html/top.html", "admmjipmmciaobhojoghlmleefbicajg/content/ui/popup-in-page.html", "caljgklbbfbcjjanaijlacgncafpegll/panel.html", "bfgdeiadkckfbkeigkoncpdieiiefpig/popup.html", "ajopnjidmegmdimjlfnijceegpefgped/betterttv.js", "ecnphlgnajanjnkcmbpancdjoidceilk/content/web/options.html", "kjeghcllfecehndceplomkocgfbklffd/images/sra/GoSm.svg", "fmkadmapgofadopljbjfkapdkoienihi/main.html", "ohfgljdgelakfkefopgklcohadegdpjf/iframe.html", "mbckjcfnjmoiinpgddefodcighgikkgn/common/ui/css/extension.css", "gkojfkhlekighikafcpjkiklfbnlmeio/js/popup.html", "gbkeegbaiigmenfmjfclcdgdpimamgkj/views/app.html", "gmbmikajjgmnabiglmofipeabaddhgne/images/driveicon32.png", "pioclpoplcdbaefihamjohnefbikjilc/consent.html", "mcbpblocgmgfnpjjppndjkmgjaogfceg/images/copy.gif", "ekhagklcjbdpajgpjgmbionohlpdbjgc/progressWindow/progressWindow.html", "nlipoenfbbikpbjkfpfillcgkoblgpmj/camera.html", "eedlgdlajadkbbjoobobefphmfkcchfk/img/favicon16.png", "pachckjkecffpdphbpmfolblodfkgbhl/options.html", "gohjpllcolmccldfdggmamodembldgpc/inject.html", "bfnaelmomeimhlpmgjnjophhpkkoljpa/content_script/inpage.js", "ndnaehgpjlnokgebbaldlmgkapkpjkkb/images/mailtrack-crx-sprite_2x.png", "fdjamakpfbbddfjaooikfcpapjohcfmg/content/webui/index.html", "bkkbcggnhapdmkeljlodobbkopceiche/message.html", "inoeonmfapjbbkmdafoankkfajkcphgd/gdocs.page.bundle.js", "majdfhpaihoncoakbjgbdhglocklcgno/images/desktop_notification_1.jpg", "niloccemoadcdkdjlinkgdfekeahmflj/chunks/actions-639cd34d.js", "mclkkofklkfljcocdinagocijmpgbhab/_locales/am/messages.json", "jgfbgkjjlonelmpenhpfeeljjlcgnkpe/images/100x100.png", "mgijmajocgfcbeboacabfgobmjgjcoja/content.min.css", "mlomiejdfkolichcflejclcbmpeaniij/app/templates/trackers-preview.html", "neebplgakaahbhdphmkckjjcegoiijjo/chrome/content/selectionHook.js", "nngceckbapebfimnlniiiahkandclblb/notification/bar.html", "nffaoalbilbmmfgbnbgppjihopabppdk/inject.css", "djflhoibgkdhkhhcedjiklpkjnoahfmg/jquery.js", "kejbdjndbnbjgmefkgdddjlbokphdefk/api/tag_assistant_api_bin.js", "dagcmkpagjlhakfdhnbomgmjdpkdklff/index.html", "aeblfdkhhhdcdjpifhhbdiojplfjncoa/inline/menu/menu.html", "fbgcedjacmlbgleddnoacbnijgmiolem/images/128x128_Bing_Grey.png", "klekeajafkkpokaofllcadenjdckhinm/images/logo.png", "lkhjgdkpibcepflmlgahofcmeagjmecc/ScenerIcon.png", "bpconcjcammlapcogcnnelfmaeghhagj/favicon.png", "bfbameneiokkgbdmiekhjnmfkcnldhhm/_locales/en_US/messages.json", "ohcpnigalekghcmgcdcenkpelffpdolg/img/icon16.png", "oeopbcgkkoapgobdbedcemjljbihmemj/options.html", "eiimnmioipafcokbfikbljfdeojpcgbh/public/block-extensions-page.html", "mhkhmbddkmdggbhaaaodilponhnccicb/icons/icon128.png", "hbapdpeemoojbophdfndmlgdhppljgmp/img/alert.png", "adbacgifemdbhdkfppmeilbgppmhaobf/js/page/fetchAngular.js", "ghgabhipcejejjmhhchfonmamedcbeod/ehistory936.html", "lphicbbhfmllgmomkkhjfkpbdlncafbn/images/btn/logo16.png", "gjknjjomckknofjidppipffbpoekiipm/static/assets/elements/close.svg", "ponfpcnoihfmfllpaingbgckeeldkhle/resources/vendor/asphalt/A8_Centenario.jpg", "oldceeleldhonbafppcapldpdifcinji/assets/fonts/Roboto-Mono-latin-bold.woff2", "hjngolefdpdnooamgdldlkjgmdcmcjnc/content/0.df5f7ecad51c12b88a54.js", "nlbejmccbhkncgokjcmghpfloaajcffj/static/assets/connection_button/connected.png", "bigefpfhnfcobdlfbedofhhaibnlghod/mega/secure.html", "fgddmllnllkalaagkghckoinaemmogpe/html/networkLock.html", "hdhinadidafjejdhmfkjgnolgimiaplp/js/page/google-doc-force-html.js", "gcbommkclmclpchllfjekcdonpmejbdp/pages/cancel/index.html", "kklailfgofogmmdlhgmjgenehkjoioip/grid.user.js", "kglhbbefdnlheedjiejgomgmfplipfeb/jitsi-logo-48x48.png", "gojbdfnpnhogfdgjbigejoaolejmgdhk/clipper.html", "kbmfpngjjgdllneeigpgjifpgocmfgmb/prompt.html", "eppiocemhmnlbhjplcgkofciiegomcon/content/safecheck-notification/notification-iframe/index.html", "hoombieeljmmljlkjmnheibnpciblicm/images/anki-import.png", "gpaiobkfhnonedkhhfjpmhdalgeoebfa/feedback.html", "hmdcmlfkchdmnmnmheododdhjedfccka/js/edropper2.js", "nllcnknpjnininklegdoijpljgdjkijc/media/WordtuneOffIcon.png", "gppongmhjkpfnbhagpmjfkannfbllamg/js/js.js", "nhdogjmejiglipccpnnnanhbledajbpd/devtools.html", "jabopobgcpjmedljpbcaablpmlmfcogm/wf.css", "hodiladlefdpcbemnbbcpclbmknkiaem/dist/content.js", "lmhkpmbekcpmknklioeibfkpmmfibljd/page.bundle.js", "fnjhmkhhmkbjkkabndcnnogagogbneec/in-page.js", "fjgncogppolhfdpijihbpfmeohpaadpc/static/templates/auth-info.html", "pejdijmoenmkgeppbflobdenhhabjlaj/completion_list.html", "hkjemkcbndldepdbnbdnibeppofoooio/icon16.png", "hnfanknocfeofbddgcijnmhnfnkdnaad/requestProvider.js", "cmeakgjggjdlcpncigglobpjbkabhmjl/_locales/bg/controls.json", "jjfblogammkiefalfpafidabbnamoknm/built/inject.css", "jfbnmfgkohlfclfnplnlenbalpppohkm/background.html", "oiiaigjnkhngdbnoookogelabohpglmd/img/hubspot-logo-16-grey.png", "lgblnfidahcdcjddiepkckcfdhpknnjh/views/web_accessible/block-element/view.html", "ohahllgiabjaoigichmmfljhkcfikeof/lib/content-script/assistant/css/font-awesome.min.css", "noaijdpnepcgjemiklgfkcfbkokogabh/content/html/options/options.html", "feepmdlmhplaojabeoecaobfmibooaid/content/web/viewer.html", "ljflmlehinmoeknoonhibbjpldiijjmm/features.json", "oemmndcbldboiebfnladdacbdfmadadm/content/web/viewer.html", "phidhnmbkbkbkbknhldmpmnacgicphkf/static/images/logo.svg", "hoklmmgfnpapgjgcpechhaamimifchmp/panel/panel.html", "fbcohnmimjicjdomonkcbcpbpnhggkip/toolbar.html", "ammjkodgmmoknidbanneddgankgfejfh/twitch.js", "cpaibbcbodhimfnjnakiidgbpiehfgci/pages/tk-inpages-frame.html", "ohlencieiipommannpdfcmfdpjjmeolj/core.html", "kjacjjdnoddnpbbcjilcajfhhbdhkpgk/1-M7USGIC2.png", "dmpojjilddefgnhiicjcmhbkjgbbclob/includes/sovetnik.opera.min.js", "akdgnmcogleenhbclghghlkkdndkjdjc/static/fonts/fontawesome-webfont.woff", "eakacpaijcpapndcfffdgphdiccmpknp/images/mozicon_19x19.png", "cfnpidifppmenkapgihekkeednfoenal/pages/blocked/blocked.html", "ailoabdmgclmfmhdagmlohpjlbpffblp/Roboto-Bold.woff", "hhbcihapcmaemjinlbgafnjjihbdmjnf/images/default_16px_normal.png", "mciiogijehkdemklbdcbfkefimifhecn/icons/newd.png", "jlgkpaicikihijadgifklkbpdajbkhjo/icon.png", "kdfieneakcjfaiglcfcgkidlkmlijjnh/writer/css/style.css", "nbmoafcmbajniiapeidgficgifbfmjfo/common/mocks/empty.js", "enfolipbjmnmleonhhebhalojdpcpdoo/ocrTexthelp.css", "cbnaodkpfinfiipjblikofhlhlcickei/static/css/gistnoteGlobal.css", "gekdekpbfehejjiecgonmgmepbdnaggp/assets/img/_brand/icon/120px.png", "njgehaondchbmjmajphnhlojfnbfokng/_locales/en/messages.json", "chlffgpmiacpedhhbkiomidkjlcfhogd/action_android.png", "hgjdbeiflalimgifllheflljdconlbig/views/notifications/unsafe_site/index.html", "pnnfemgpilpdaojpnkjdgfgbnnjojfik/blank.png", "iggpfpnahkgpnindfkdncknoldgnccdg/options.html", "kkelicaakdanhinjdeammmilcgefonfh/assets/tpl/resize-tooltip.css", "fnbdnhhicmebfgdgglcdacdapkcihcoh/resources/sprites.png", "mcgbeeipkmelnpldkobichboakdfaeon/images/Jcrop.gif", "fddjpichkajmnkjhcmpbbjdmmcodnkej/pages/common.css", "pbhelknnhilelbnhfpcjlcabhmfangik/manifest.json", "mnjggcdmjocbbbhaepdhchncahnbgone/icons/LogoSponsorBlocker256px.png", "mhmphnocemakkjdampibehejoaleebpo/enabler.html", "lklfbkdigihjaaeamncibechhgalldgl/128x128.png", "nlmmgnhgdeffjkdckmikfpnddkbbfkkk/images/icon24.png", "nlbjncdgjeocebhnmkbbbdekmmmcbfjd/iframe.js", "pnlccmojcmeohlpggmfnbbiapkmbliob/password-generator.html", "jhhclmfgfllimlhabjkgkeebkbiadflb/reader.html", "aiifbnbfobpmeekipheeijimdpnlpgpp/inpage.js", "nnjjahlikiabnchcpehcpkdeckfgnohf/icon-small.png", "gjfpmkejnolcfklaaddjnckanhhgegla/assets/installed.json", "gphhapmejobijbbhgpjhcjognlahblep/include/sweettooth-api.js", "iodihamcpbpeioajjeobimgagajmlibd/html/nassh.html", "mooikfkahbdckldjjndioackbalphokd/icons/icon128.png", "dhikfimimcjpoaliefjlffaebdeomeni/chrome-downloaded-file.png", "iidnbdjijdkbmajdffnidomddglmieko/fonts/open-sans-v23-latin-600.woff", "jnhgnonknehpejjnehehllkliplmbmhn/images/icon16.png", "pnjaodmkngahhkoihejjehlcdlnohgmp/extension-icons/icon48x48.png", "bcocdbombenodlegijagbhdjbifpiijp/ig-injection/index.js", "eenflijjbchafephdplkdmeenekabdfb/assets/fonts/OpenSans-Regular-cyrillic-400.woff2", "laankejkbhbdhmipfmgcngdelahlfoji/common/img/eye_19x19_red.png", "hgmhmanijnjhaffoampdlllchpolkdnj/html/source_popup.html", "gngocbkfmikdgphklgmmehbjjlfgdemm/assets/icons/128.png", "kpiecbcckbofpmkkkdibbllpinceiihk/install.html", "pjbgfifennfhnbkhoidkdchbflppjncb/content_change/сustom/github.css", "mloajfnmjckfjbeeofcdaecbelnblden/go.html", "oknpjjbmpnndlpmnhmekjpocelpnlfdi/app.html", "ajphlblkfpppdpkgokiejbjfohfohhmk/mic.html", "maekfnoeejhpjfkfmdlckioggdcdofpg/css/content.css", "llaficoajjainaijghjlofdfmbjpebpa/images/cropper/img.png", "bfogiafebfohielmmehodmfbbebbbpei/content_scripts/prompt/prompt.html", "nnnmhgkokpalnmbeighfomegjfkklkle/popup.htm", "ceibjdigmfbbgcpkkdpmjokkokklodmc/0.js", "aejoelaoggembcahagimdiliamlcdmfm/images/icon/favicon.ico", "eljapbgkmlngdpckoiiibecpemleclhh/resources/AdobeBlank2VF.ttf", "jkncabbipkgbconhaajbapbhokpbgkdc/nativeinstall.html", "ibnejdfjmmkpcnlpebklmnkoeoihofec/dist/pageHook.js", "iplffkdpngmdjhlpjmppncnlhomiipha/unpaywall.html", "pgfbdgicjmhenccemcijooffohcdanic/manifest.json", "idfiabaafjemgcecklpgnebaebonghka/manifest.json", "jdopnakmnlnccgpfpmjmdjjohmcdgabp/camera.iframe.html", "amfojhdiedpdnlijjbhjnhokbnohfdfb/inject.html", "cgdjpilhipecahhcilnafpblkieebhea/content/images/s2k-sprite.png", "nmpgaoofmjlimabncmnmnopjabbflegf/css/sidebar.css", "bckjlihkmgolmgkchbpiponapgjenaoa/images/128.png", "ijejnggjjphlenbhmjhhgcdpehhacaal/audio-devices.html", "dbepggeogbaibhgnhhndojpepiihcmeb/pages/vomnibar.html", "kmffehbidlalibfeklaefnckpidbodff/loader.html", "cdonnmffkdaoajfknoeeecmchibpmkmg/audio-control.html", "lgjhepbpjcmfmjlpkkdjlbgomamkgonb/css/dark_mode_docs.css", "jdogphakondfdmcanpapfahkdomaicfa/img/ckauth19x.png", "ifajfiofeifbbhbionejdliodenmecna/status", "hipncndjamdcmphkgngojegjblibadbe/blocked.html", "dgbldpiollgaehnlegmfhioconikkjjh/views/notifications/search_extension_uninstalled/index.html", "bmhcbmnbenmcecpmpepghooflbehcack/views/appInstall/appInstall-v1.css", "jjckigopagkhaikodedjnmbccfpnmiea/block.html", "ihmgiclibbndffejedjimfjmfoabpcke/src/kernel/init.js", "cplklnmnlbnpmjogncfgfijoopmnlemp/skin/logo24.png", "hgeljhfekpckiiplhkigfehkdpldcggm/blank.html", "bkhaagjahfmjljalopjnoealnfndnagc/fonts/anonymous-pro.woff2", "lokjgaehpcnlmkebpmjiofccpklbmoci/history-change-listener.js", "cfidkbgamfhdgmedldkagjopnbobdmdn/sb-svg.svg", "jkompbllimaoekaogchhkmkdogpkhojg/img/__bsr_sample.png", "lmnganadkecefnhncokdlaohlkneihio/enable.js", "ddaloccgjfibfpkalenodgehlhkgoahe/nuanria.Chrome.js", "gnblbpbepfbfmoobegdogkglpbhcjofh/libs/css/alertify.css", "bdfcnmeidppjeaggnmidamkiddifkdib/common.js", "kekahkplibinaibelipdcikofmedafmb/blank.gif", "hkhggnncdpfibdhinjiegagmopldibha/options.html", "jbbplnpkjmmeebjpijfedlgcdilocofh/background.js", "cmkdbmfndkfgebldhnkbfhlneefdaaip/js/wrs_env.js", "oejgccbfbmkkpaidnkphaiaecficdnfn/html/login.html", "bnomihfieiccainjcjblhegjgglakjdd/options-page/index.html", "hddnkoipeenegfoeaoibdmnaalmgkpip/img/icon-128.png", "eenjdnjldapjajjofmldgmkjaienebbj/message-dialog.html", "bfegaehidkkcfaikpaijcdahnpikhobf/favicon-16.png", "fdedigfpeejoaoicpppjcpicekleaedb/assets/128.png", "odlpjhnipdekfkdkadoecooboghijleh/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2", "aodjmnfhjibkcdimpodiifdjnnncaafh/popup.html", "emalgedpdlghbkikiaeocoblajamonoh/fonts/fontawesome-webfont.eot", "felcpnemckonbbmnoakbjgjkgokkbaeo/images/bg-left.png", "pfjibkklgpfcfdlhijfglamdnkjnpdeg/settings.html", "cofdbpoegempjloogbagkncekinflcnj/images/arrow-down-variant.svg", "mpbjkejclgfgadiemmefgebjfooflfhl/src/setup/index.html", "kohfgcgbkjodfcfkcackpagifgbcmimk/assets/bootstrap-material-design-icons/css/material-icons.css", "mcebeofpilippmndlpcghpmghcljajna/frame.html", "njcpapmgiimlmlelomamnobmdmhpbfhd/assets/icon/content/icon.svg", "honjcnefekfnompampcpmcdadibmjhlk/style.css", "pjhnilfooknlkdonmjnleaomamfehkli/nflxmultisubs.min.js", "kiodaajmphnkcajieajajinghpejdjai/assets/images/icon128.png", "lfpjkncokllnfokkgpkobnkbkmelfefj/pages/test_area.html", "gbgjpdhhnbgmnafojckjmjogcpoinlim/icons/Avatar_128.png", "appcnhiefcidclcdjeahgklghghihfok/shims.js", "jdbnofccmhefkmjbkkdkfiicjkgofkdh/css/sidebar.css", "jjghhkepijgakdammjldcbnjehfkfmha/common/fonts/SalesforceSans-Regular.woff2", "pccckmaobkjjboncdfnnofkonhgpceea/images/loading.gif", "pflmllfnnabikmfkkaddkoolinlfninn/keyboard.html", "megbklhjamjbcafknkgmokldgolkdfig/assets/VirtualSessionHelper.js", "iihkglbebihpaflfihhkfmpabjgdpnol/css/toolbar.css", "jgllchbkhjeiaombmpkapalbmpolmelp/js/FriendDestroyerFramework.js", "dkaagdgjmgdmbnecmcefdhjekcoceebi/settings.html", "glcipcfhmopcgidicgdociohdoicpdfc/icon128.png", "dbjbempljhcmhlfpfacalomonjpalpko/libs/bootstrap/3.4.1/js/bootstrap.min.js", "cpgaheeihidjmolbakklolchdplenjai/icons/download_black.png", "oiecklaabeielolbliiddlbokpfnmhba/images/plugin_icon-128.png", "agjnjboanicjcpenljmaaigopkgdnihi/js/devHelper.js", "jjnfhbcilcppomkcmkbbmcadoihkkgah/web_accessible/pixel.jpg", "bgmpjmdignpongmfjpgaikghaajeidid/images/i-icons.gif", "hnlkiofnhhoahaiimdicppgemmmomijo/web-accessible-resources/redirects/1x1-transparent.gif", "iekgholhfibbgedbemeoglmklmeleonb/img/128.png", "pbcgnkmbeodkmiijjfnliicelkjfcldg/content/css/web.css", "necpbmbhhdiplmfhmjicabdeighkndkn/panel/panel.html", "pnhplgjpclknigjpccbcnmicgcieojbh/diigolet/images/3dfbg.gif", "nbkomboflhdlliegkaiepilnfmophgfg/style.js", "npnbdojkgkbcdfdjlfdmplppdphlhhcf/webeditor.js", "emffkefkbkpkgpdeeooapgaicgmcbolj/images/cards/feedback.png", "dkfhfaphfkopdgpbfkebjfcblcafcmpi/img/mightylogo2.png", "iibninhmiggehlcdolcilmhacighjamp/assets/all-icon.svg", "fofjcndophjadilglgimelemjkjblgpf/index.bundle.js", "pmjeegjhjdlccodhacdgbgfagbpmccpe/assets/images/$-selected.png", "idpbkophnbfijcnlffdmmppgnncgappc/img/gmail32.png", "kegphgaihkjoophpabchkmpaknehfamb/assets/css/common.css", "adlpodnneegcnbophopdmhedicjbcgco/caa/styles.css", "meffljleomgifbbcffejnmhjagncfpbd/img/128.png", "alncdjedloppbablonallfbkeiknmkdi/css/custom-styles.css", "noojglkidnpfjbincgijbaiedldjfbhh/manifest.json", "kfhgpagdjjoieckminnmigmpeclkdmjm/img/alert-icon.svg", "nlgphodeccebbcnkgmokeegopgpnjfkc/data/content_script/custom/7plusau.css", "gfjopfpjmkcfgjpogepmdjmcnihfpokn/img/icons/check-30.png", "fooolghllnmhmmndgjiamiiodkpenpbb/autofill.html", "ocginjipilabheemhfbedijlhajbcabh/css/darkmode.css", "djnhkfljnimcpelfndpcjcgngmefaobl/sound/start.wav", "pjnefijmagpdjfhhkpljicbbpicelgko/settings.html", "icommmppmcbfknchmbonjomcmhkhofmo/assets/icons/128.png", "cmllgdnjnkbapbchnebiedipojhmnjej/img/bg_wave.png", "jlleokkdhkflpmghiioglgmnminbekdi/img/128x128.png", "jgphnjokjhjlcnnajmfjlacjnjkhleah/js/chrome.js", "kdmnjgijlmjgmimahnillepgcgeemffb/build/ut.js", "alhgpfoeiimagjlnfekdhkjlkiomcapa/loading.html", "nndknepjnldbdbepjfgmncbggmopgden/dist/index.html", "onhiacboedfinnofagfgoaanfedhmfab/dist/assets/fonts/MaterialIcons.woff", "onepmapfbjohnegdmfhndpefjkppbjkm/js/code.js", "igkkmokkmlbkkgdnkkancbonkbbmkioc/audiosources/audiosources.html", "jfiihjeimjpkpoaekpdpllpaeichkiod/marker.png", "nglbhlefjhcjockellmeclkcijildjhi/content.css", "fbcgkphadgmbalmlklhbdagcicajenei/jquery-3.1.0.min.js", "ecabifbgmdmgdllomnfinbmaellmclnh/data/reader/template.html", "blkboeaihdlecgdjjgkcabbacndbjibc/shell.html", "ipikiaejjblmdopojhpejjmbedhlibno/close_icon.png", "ncldcbhpeplkfijdhnoepdgdnmjkckij/img/128ico.png", "lpfcbjknijpeeillifnkikgncikgfhdo/icon-128.png", "hmlcjjclebjnfohgmgikjfnbmfkigocc/images/icon-16.png", "hbdkkfheckcdppiaiabobmennhijkknn/frame-seostats.html", "jajilbjjinjmgcibalaakngmkilboobh/widget.html", "fpdnjdlbdmifoocedhkighhlbchbiikl/block.html", "jipdnfibhldikgcjhfnomkfpcebammhp/css/popup.css", "oiaejidbmkiecgbjeifoejpgmdaleoha/editor/index.css", "ikhdkkncnoglghljlkmcimlnlhkeamad/normalize.css", "jmpepeebcbihafjjadogphmbgiffiajh/trs.js", "igiofjhpmpihnifddepnpngfjhkfenbp/error.html", "inlikjemeeknofckkjolnjbpehgadgge/ui/htmlselector.html", "logldmlncddmdfcjaaljjjkajcnacigc/toast_icon.png", "aakchaleigkohafkfjfjbblobjifikek/content/youtube.injected.js", "dgmanlpmmkibanfdgjocnabmcaclkmod/options.css", "lbnoedlobifdhbpjkcfhcbdcjhampmne/images/logo3.png", "dnhpnfgdlenaccegplpojghhmaamnnfp/html/options.html", "giihipjfimkajhlcilipnjeohabimjhi/img/_analyze.svg", "gfbepnlhpkbgbkcebjnfhgjckibfdfkc/skin/FP-logo-rounded.png", "hgimnogjllphhhkhlmebbmlgjoejdpjl/bar.css", "ggfgijbpiheegefliciemofobhmofgce/img/header.png", "ldjkgaaoikpmhmkelcgkgacicjfbofhh/alpha_off.png", "pkgccpejnmalmdinmhkkfafefagiiiad/static/img/fe-16.png", "amaaokahonnfjjemodnpmeenfpnnbkco/fa_subset/css/all.css", "jjicbefpemnphinccgikpdaagjebbnhg/model_frame.html", "emnphkkblegpebimobpbekeedfgemhof/event.js", "blddohgncmehcepnokognejaaahehncd/styles.css", "kfgepjmmgamniaefbjlbacahkjjnjoaa/js/gmail-reverse-conversation.js", "kdbmhfkmnlmbkgbabkdealhhbfhlmmon/options/options.html", "mcpmofnlkemfkhgngcdppgbhncoflmpe/data/js/lib/jquery.min.js", "jkhhdcaafjabenpmpcpgdjiffdpmmcjb/images/sad_owl.png", "nddmmcpmdbkooddfjcohmlcfclhllgeh/js/libs/ruffle.js", "ahmkjjgdligadogjedmnogbpbcpofeeo/html/suspended.html", "fddhonoimfhgiopglkiokmofecgdiedb/redirect.html", "donbcfbmhbcapadipfkeojnmajbakjdc/_locales/de/messages.json", "jjdemeiffadmmjhkbbpglgnlgeafomjo/assets/pages/frame.html", "ofgdcdohlhjfdhbnfkikfeakhpojhpgm/js/background.js", "kpbnombpnpcffllnianjibmpadjolanh/statics/fonts/bilibili-helper.woff", "mjdepdfccjgcndkmemponafgioodelna/images/background.png", "dpfdidlhkillibefedclmbogopmndngo/_locales/cs/messages.json", "cijidiollmnkegoghpfobabpecdkeiah/images/injected/activity-active.png", "kkgaechmpjgbojahkofamdjkaklgbdkc/html/panel.html", "npdkkcjlmhcnnaoobfdjndibfkkhhdfn/popup/popup.html", "mnlohknjofogcljbcknkakphddjpijak/assets/img/icon280.png", "kgejglhpjiefppelpmljglcjbhoiplfn/chromevox/background/keymaps/next_keymap.json", "offfjidagceabmodhpcngpemnnlojnhn/blocked-user.png", "dngbhajancmfmdnmhhdknhooljkddgnk/javascripts/background.js", "bomfdkbfpdhijjbeoicnfhjbdhncfhig/dist/pp-cs.css", "mdnleldcmiljblolnjhpnblkcekpdkpa/libs/requestly-web-sdk.js", "gphandlahdpffmccakmbngmbjnjiiahp/content/web/viewer.html", "fggkaccpbmombhnjkjokndojfgagejfb/content.css", "gcbalfbdmfieckjlnblleoemohcganoc/content_script.js", "jlmpjdjjbgclbocgajdjefcidcncaied/index.html", "ndmelloaocjpkhmajmkdbbhimohlclkd/game/js/game-background.js", "cpbghpalffgmgocmnigfhalghmaemffo/bootstrap.min.css", "ocggccaacacpienfcgmgcihoombokbbj/pages/newtab/newtab.html", "fhkhmblpnhfedddndenodedcaknclgkd/img/camera.svg", "dkfmiibnoifcbiblibjpfalbdfpdoeni/instagram-128.png", "llccdnmbipddnkhmldacpcjjcnljpoij/javascripts/background.js", "ojclfkinnapkabameogjppmeedlicean/16.png", "cneaciknhhaahhdediboeafhdlbdoodg/html/loader.html", "okfkdaglfjjjfefdcppliegebpoegaii/static/css/tailwind.dist.css", "lmcngpkjkplipamgflhioabnhnopeabf/popup/popup.html", "pliibjocnfmkagafnbkfcimonlnlpghj/0.8bd3aa3a06ddec46a321.js", "lnbmbgocenenhhhdojdielgnmeflbnfb/assets/echarts.min.js", "njopapoodmifmcogpingplfphojnfeea/_locales/de/messages.json", "apalagnadaipfbckpdghfbahagdcldka/capture.html", "cnojnbdhbhnkbcieeekonklommdnndci/src/content/style.css", "lghjfnfolmcikomdjmoiemllfnlmmoko/html/popup.html", "dbfipcjecamggjfabeaclacjoohfjhhn/dist/css/content.css", "dlmebkoiahbppacaicbgncnjhbpdfkcc/assets/icons/128.png", "ekeeeebmbhkkjcaoicinbdjmklipppkj/icon-32.png", "ojplmecpdpgccookcobabopnaifgidhf/koovsCheckcookie.js", "jfpjkgdpgdbddknpgplfkjjfncenlmkf/cameraOnly.html", "dhiaggccakkgdfcadnklkbljcgicpckn/extension/082dc50470339c1b4d6a.worker.js", "naffoicfphgmlgikpcmghdooejkboifd/skin/background.png", "aefkmifgmaafnojlojpnekbpbmjiiogg/data/ui/ui.css", "ibppednjgooiepmkgdcoppnmbhmieefh/js/Utils.js", "aggiiclaiamajehmlfpkjmlbadmkledi/popup.js", "dipiagiiohfljcicegpgffpbnjmgjcnf/fonts/icons-16.woff", "iniomamdnhnbknmlbcjpaagfoelmlafg/static/assets/flags/br.svg", "eefedolmcildfckjamddopaplfiiankl/images/pen.svg", "gnldpbnocfnlkkicnaplmkaphfdnlplb/Fonts/Bowtie/Bowtie.svg", "npmjjkphdlmbeidbdbfefgedondknlaf/assets/static/128.png", "lcalofoidkpopkkadcjjgcnnkcoalpba/js/mediaSourceSwap.js", "mgbmfbimbcffegjaagiolbjpfbepjogk/icons/grid.png", "pgniedifoejifjkndekolimjeclnokkb/searchWorker.js", "bhplkbgoehhhddaoolmakpocnenplmhf/player.html", "mfembjnmeainjncdflaoclcjadfhpoim/pages/options.html", "ggaabchcecdbomdcnbahdfddfikjmphe/images/celebration.svg", "hegneaniplmfjcmohoclabblbahcbjoe/img/Icon_128.png", "nbokbjkabcmbfdlbddjidfmibcpneigj/img/cursor.png", "fkopaaikpmfhpmoobnmklgmcgmhgfkcd/inject.css", "lokadhdaghfjbmailhhenifjejpokche/css/content.css", "epanfjkfahimkgomnigadpkobaefekcd/panel.html", "fepaalfjfchbdianlgginbmpeeacahoo/settings.html", "jdelodjlpgkjenhcongcfdcocmjgjbci/assets/happy.png", "mldaiedoebimcgkokmknonjefkionldi/content/fonts.css", "gkjnkapjmjfpipfcccnjbjcbgdnahpjp/images/content/calendar.svg", "aaekanoannlhnajolbijaoflfhikcgng/assets/charcoal-messenger.svg", "iahnhfdhidomcpggpaimmmahffihkfnj/JSON-handle/JSON-handle.html", "dhhpefjklgkmgeafimnjhojgjamoafof/message-panel.html", "hhnjkanigjoiglnlopahbbjdbfhkndjk/images/icon128.png", "mghabdfikjldejcdcmclcmpcmknjahli/logo.png", "plpdjbappofmfbgdmhoaabefbobddchk/images/arrow.png", "hiajdlfgbgnnjakkbnpdhmhfhklkbiol/options.html", "mhpcabliilgadobjpkameggapnpeppdg/img/128.png", "cogmkaeijeflocngklepoknelfjpdjng/_locales/ar/messages.json", "opmibphegngmljhikklndacjdpkmhocp/img/img-001.jpg", "kkkbiiikppgjdiebcabomlbidfodipjg/css/font-awesome.min.css", "abdkkegmcbiomijcbdaodaflgehfffed/ui/pixel.png", "cpcifbdmkopohnnofedkjghjiclmhdah/img/icon16.png", "khncfooichmfjbepaaaebmommgaepoid/js/unhook-yt.js", "hgmoccdbjhknikckedaaebbpdeebhiei/images/dr-chart.png", "oboonakemofpalcgghocfoadofidjkkk/icons/disconnected.svg", "ndhinffkekpekljifjkkkkkhopnjodja/128x128.png", "iapifmceeokikomajpccajhjpacjmibe/assets/icons/icon128.png", "ljdobmomdgdljniojadhoplhkpialdid/page/prompt.js", "cdnapgfjopgaggbmfgbiinmmbdcglnam/fonts/opendyslexic/OpenDyslexic-Bold.otf", "imilbobhamcfahccagbncamhpnbkaenm/themes-css/amazon-base16tomorrow.css", "eebnbmbhdfnfhfhigoklhaklkodghbla/scripts/injected/main.html", "fiabciakcmgepblmdkmemdbbkilneeeh/background.html", "dgjhfomjieaadpoljlnidmbgkdffpack/img/icon-128.png", "nlbmnnijcnlegkjjpcfjclmcfggfefdm/js/cxWeb3.js", "nbhfcmbdimdbbclfngkjfmgmjhnkjocl/images/download-button-loader.gif", "aeidadjdhppdffggfgjpanbafaedankd/inject.js", "andgibkjiikabclfdkecpmdkfanpdapf/img/128x128.png", "mjgcgnfikekladnkhnimljcalfibijha/blank.html", "clgenfnodoocmhnlnpknojdbjjnmecff/frame.html", "bofbpdmkbmlancfihdncikcigpokmdda/icon.png", "goficmpcgcnombioohjcgdhbaloknabb/NoteBoard.png", "bmjmipppabdlpjccanalncobmbacckjn/js/content/main.js", "eopjamdnofihpioajgfdikhhbobonhbb/ab20.png", "ejgnolahdlcimijhloboakpjogbfdkkp/images/skins/meow.png", "inobiceghmpkaklcknpniboilbjmlald/manifest.json", "ijllcpnolfcooahcekpamkbidhejabll/website_list.json", "fpnmgdkabkmnadcjpehmlllkndpkmiak/css/archive.css", "ffdaeeijbbijklfcpahbghahojgfgebo/imgs/crop.svg", "akcaclljjmjgdbamkaefciglfikonadh/images/i-icons.gif", "omimccinlhlkpjaeaocglgmkbelejlhj/data/content_script/page_context/15ef2c6fadd511d2a091.wasm", "nnajoiemfpldioamchanognpjmocgkbg/images/chart_icon.png", "mpcaainmfjjigeicjnlkdfajbioopjko/icons/app_icon_connected_128.png", "bdlcnpceagnkjnjlbbbcepohejbheilk/_locales/en/messages.json", "pemhgklkefakciniebenbfclihhmmfcd/img/bolt.png", "gojogohjgpelafgaeejgelmplndppifh/img/32x32.png", "hfdhpmpfpcnbboppkkkblilhbloejijj/assets/appIcons/cog-solid.svg", "eggkanocgddhmamlbiijnphhppkpkmkl/tree/js/treeview.js", "aleggpabliehgbeagmfhnodcijcmbonb/content/css/images/logo.png", "pgbdljpkijehgoacbjpolaomhkoffhnl/shared/img/compose_button_screenshot.png", "kdadialhpiikehpdeejjeiikopddkjem/index.html", "hhinaapppaileiechjoiifaancjggfjm/connectors/deezer-dom-inject.js", "fefnkplkicihcoenmljhbihhaaagjhpp/pages/notification.html", "jjmdplljmniahpamcmabdnahmjdlikpm/icons/128.png", "jpegpdbkhceiipenjmaglmphmfjjpbmp/content.html", "pbichgopagjidnkeaablhiediibgbmec/external/jquery-3.3.1.min.js", "lneaocagcijjdpkcabeanfpdbmapcjjg/images/icon-48.png", "gbammbheopgpmaagmckhpjbfgdfkpadb/utils.js", "oebpmncolmhiapingjaagmapififiakb/images/paypal.gif", "bnompdfnhdbgdaoanapncknhmckenfog/image/loading.gif", "klejemegaoblahjdpcajmpcnjjmkmkkf/images/advanced-timer.png", "jnihajbhpnppcggbcgedagnkighmdlei/livereload.js", "febilkbfcbhebfnokafefeacimjdckgl/bootstrap.css", "jfpdnkkdgghlpdgldicfgnnnkhdfhocg/options.html", "epejdmjgfibjaffbmojllapapjejipkh/popup.html", "ckejmhbmlajgoklhgbapkiccekfoccmk/assets/pictos/logo.png", "idgadaccgipmpannjkmfddolnnhmeklj/images/folder_16.png", "diankknpkndanachmlckaikddgcehkod/pages/frame_dd.html", "cankofcoohmbhfpcemhmaaeennfbnmgp/cadmium-playercore-6.0033.414.911-1080p.js", "enddgifdbfoefnelepppgaabobdfbcpe/icons/btn_donateCC_LG.gif", "ibkclpciafdglkjkcibmohobjkcfkaef/styles/inject.css", "iebpjdmgckacbodjpijphcplhebcmeop/images/icon.addressbar.gif", "kajibbejlbohfaggdiogboambcijhkke/app/app.html", "hhojmcideegachlhfgfdhailpfhgknjm/web_accessible_resources/index.js", "pncfbmialoiaghdehhbnbhkkgmjanfhe/pages/options.html", "nbhcbdghjpllgmfilhnhkllmkecfmpld/js/libs/jquery.min.js", "joinpgckiioeklibflapokicmndlcnef/clipper-min.js", "dkgjopcolgcafhnicdahjemapkniikeh/_locales/de/messages.json", "hilpchhlogijamlemmggobblmfcdkomg/assets/images/chevron_down.svg", "kmcfomidfpdkfieipokbalgegidffkal/injected/dialog/dialog.html", "kjcloihghgncbdkaafgkckbokjnehfmo/scripts/md5.js", "heeikiohkfkolhmdodhcjdklofmhmmhn/icons/icon128.png", "emikbbbebcdfohonlaifafnoanocnebl/js/minerkill.js", "ckkdlimhmcjmikdlpkmbgfkaikojcbjk/themes/github.css", "noogafoofpebimajpfpamcfhoaifemoa/suspended.html", "ebgofhigpedaepplnmglnedbfjemmpnh/config.json", "dionggdmdobjjolppiiejleechniphok/assets/css/castplayer.css", "lecdifefmmfjnjjinhaennhdlmcaeeeb/manifest.json", "adicaaffkmhgnfheifkjhopmambgfihl/js/hook.js", "cgnhpniejimbnmgiccckgiaejdgbeebb/imgs/128.png", "ldmmifpegigmeammaeckplhnjbbpccmm/popup/index.html", "pcfbfimijgibligmbglggnbiobgjgmbk/manifest.json", "amjmjholfoknokffkiolahocokcaecnc/lib/jquery-1.10.2.min.js", "cdockenadnadldjbbgcallicgledbeoc/tuts/accessibility.gif", "pcpjpdomcbnlkbghmchnjgeejpdlonli/toucan-banner.png", "oehooocookcnclgniepdgaiankfifmmn/pancext.html", "bjfhmglciegochdpefhhlphglcehbmek/pdfjs/web/viewer.html", "eggdmhdpffgikgakkfojgiledkekfdce/styles.css", "mbopgmdnpcbohhpnfglgohlbhfongabi/theme/blazemeter/images/bm_logo.svg", "jdkknkkbebbapilgoeccciglkfbmbnfm/panel.html", "iakpdiefpdniabbekcbofaanjcpjkloe/funcs/lib/bootstrap.min.js", "pojijacppbhikhkmegdoechbfiiibppi/images/logo_128.png", "pbeamibpehihpjljabhnchghlbneiane/arrive-2.4.1.min.js", "bkiiljdcpccihhoigelmohcfkehdnjej/nightmode.css", "offnedcbhjldheanlbojaefbfbllddna/appcode.svg", "clloobkgbdighillbfomkhjhgeempchd/dolbyvoice.extension", "ajlcnbbeidbackfknkgknjefhmbngdnj/lib/ffmpeg/ffmpeg.min.js", "pggchepbleikpkhffahfabfeodghbafd/page.js", "hmeobnfnfcmdkdcmlblgagmfpfboieaf/js/inPage.bundle.js", "kbbdabhdfibnancpjfhlkhafgdilcnji/html/camera.html", "mgmiemnjjchgkmgbeljfocdjjnpjnmcg/ntp.html", "olmfgbcgfadifpdcompkdbgdifojjdlg/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2", "lkmpdpkkkeeoiodlnmlichcmfmdjbjic/icon-32.png", "edlifbnjlicfpckhgjhflgkeeibhhcii/css/injectable.css", "iiojpgfndaegfkmcdleandpjnkhmbmfj/img/icon-512.png", "kkmlkkjojmombglmlpbpapmhcaljjkde/css/bootstrap.min.css", "gmpljdlgcdkljlppaekciacdmdlhfeon/images/beside-link-icon.svg", "iffdacemhfpnchinokehhnppllonacfj/img/megaphone_48x48.png", "kmpjlilnemjciohjckjadmgmicoldglf/form.html", "bohahkiiknkelflnjjlipnaeapefmjbh/assets/css/sticky.css", "bpggmmljdiliancllaapiggllnkbjocb/img/spin.gif", "hegbjcdehgihjohghnmdpebepnoalode/images/eyen.png", "eingklpogjmofcedolfbgoomghkaamkn/icon-small.png", "nmaonghoefpmlfgaknnboiekjhfpmajh/sidebar.html", "acbiaofoeebeinacmcknopaikmecdehl/paypal-icon.svg", "khpcanbeojalbkpgpmjpdkjnkfcgfkhb/edgebgbot.png", "occjjkgifpmdgodlplnacmkejpdionan/data/images/origin/both.svg", "jdbcdblgjdpmfninkoogcfpnkjmndgje/images/storypoints-icon.png", "ijbhcaojmmmlpkghcejkoadlfhghkkoj/assets/css/c1.css", "jmpmfcjnflbcoidlgapblgpgbilinlem/scripts/bootstrap.js", "kchfmpdcejfkipopnolndinkeoipnoia/js/jquery.js", "baebodhfcfpnmnpnnheadibijemdlmip/javascripts/background.js", "fbeffbjdlemaoicjdapfpikkikjoneco/content-scripts/inject/l10n.js", "aeehekhncjhhmchjolinnihgdpapmljk/assets/img/batcat.png", "cgmnfnmlficgeijcalkgnnkigkefkbhd/icons/work_full.png", "ocpljaamllnldhepankaeljmeeeghnid/src/iframeProxy/proxy.html", "inbbmabopknohmlmilkhjdidlmbhhofd/ic.png", "adikhbfjdbjkhelbdnffogkobkekkkej/images/Capture.PNG", "ahajkaoongodcmoohkcceoklokapadfh/static/media/cash_register.mp3", "manjolceoachljppbjhfgkoomnlidkna/fonts/Montserrat.woff2", "epemkdedgaoeeobdjmkmhhhbjemckmgb/icons/icon-512.png", "lmepjnndgdhcgphilomlfekmgnnmngbi/static/template.html", "ljfpjnehmoiabkefmnjegmpdddgcdnpo/options.html", "lnkdbjbjpnpjeciipoaflmpcddinpjjp/mutationObserver.js", "nnpljppamoaalgkieeciijbcccohlpoh/img/arrow-mask.png", "cfmnkhhioonhiehehedmnjibmampjiab/popup.html", "imhhfjfjfhjjjgaedcanngoffjmcblgi/_locales/de/adblock.json", "hhfkcobomkalfdlmkongnhnhahkmnaad/lib/iSpeechRecognizer.min.js", "ldgiafaliifpknmgofiifianlnbgflgj/uglyemail.js", "canbadmphamemnmdfngmcabnjmjgaiki/options.html", "bgjfekefhjemchdeigphccilhncnjldn/icon.png", "ejhkmnhjkbekmfohoipicmpmjdbofdhm/external/sizzle.min.js", "hjnhcgkngeeahimbfhejeaiijecekhba/img/ysense_icon_48.png", "cbgkkbaghihhnaeabfcmmglhnfkfnpon/js/iframe.js", "flffekjijpabhjgpoapooggncnmcjopa/imgs/arrow_chrome_default_h_dec.png", "fdfcjfoifbjplmificlkdfneafllkgmn/src/hoverTools/hoverTools.html", "ejcfdikabeebbgbopoagpabbdokepnff/ui/inspect_start.js", "efaejpgmekdkcngpbghnpcmbpbngoclc/resources/commentbox.html", "mghhlojofjipigjobacbjdngmjafdeim/injected/ads_removal.js", "icallnadddjmdinamnolclfjanhfoafe/html/before-navigate.html", "felflkndljbjehhgadcfmijcoamhhngl/background.js", "mkccemimdjbojildcllapppfhphcfmkn/assets/style.css", "nnffbdeachhbpfapjklmpnmjcgamcdmm/data/inject/core/index.html", "lmbegcmkonokdjbhbamhpmkihpachdbk/tide_128.png", "mcglgmippekbdbmniknikdgkmnnpdnmh/assets/icons/128.png", "fjjddemkcndmbbeeibicagaobbijjgmm/content/styles.css", "ibplnjkanclpjokhdolnendpplpjiace/icons/512.png", "bocbaocobfecmglnmeaeppambideimao/google/lans/lan_fr.js", "ejllkedmklophclpgonojjkaliafeilj/images/eraser.svg", "mmbhfeiddhndihdjeganjggkmjapkffm/camera_blue-16.png", "bhbekkddpbpbibiknkcjamlkhoghieie/css/InboxGoogle.css", "angjmncdicjedpjcapomhnjeinkhdddf/stories.html", "ihjphbgdciilclbpcmagkacpohgokpep/data/resources/selection.css", "gjjpophepkbhejnglcmkdnncmaanojkf/manifest.json", "hdlehfdjcalidklijenibmpcdgjfmafn/foreground.html", "olnblpmehglpcallpnbgmikjblmkopia/toolbar.html", "nnnlfmcnfphfaobodohdkpnccfneiehe/content.css", "phpaiffimemgakmakpcehgbophkbllkf/public/js/vimeo.js", "almalgbpmcfpdaopimbdchdliminoign/content/safecheck-notification/notification-iframe/index.html", "bnjglocicdkmhmoohhfkfkbbkejdhdgc/css/webmail.css", "oiekdmlabennjdpgimlcpmphdjphlcha/newuser-en.html", "obhadkdgdffnnbdfpigjklinjhbkinfh/libs/injected.js", "cahhjpmdnfhfkgldefihhcgkaalllbld/content/content.js", "jlnhdnbbikjkdejminhdpmejldiapdgn/img/menu/logo.svg", "iojojcfflmfcejodomoafimdiianbgfe/css/images/bperson.png", "micblkellenpbfapmcpcfhcoeohhnpob/build/inject.js", "kapnjjcfcncngkadhpmijlkblpibdcgm/css/resizer.min.css", "dbepenphjfofmnjmlacfcdehikakmaap/flyout.html", "jnmdbgnckbbmblkbammnfagdmikchhnp/YoeYar-One.ttf", "kfkdboecolemdjodhmhmcibjocfopejo/packages/json-format/css/custom.css", "pkkjjapmlcncipeecdmlhaipahfdphkd/inpage/index.js", "ejmmioggcokagpjlajeilkakgphhmmbj/images/audio-blue.png", "nfphpgdlkoindbccbdmilopgeafllemo/html/light/itwpanel.html", "bekopgepchoeepdmokgkpkfhegkeohbl/backgroundscript.js", "olnconaknblgbkfgknkfmmfhhbebkekd/launcher.png", "ohodmcahedcphoipgooelhjcfahodhcj/resources/css/general.css", "hcobdfnjjaceclfdjpmmpiknimccjpmf/popup.html", "pdiebiamhaleloakpcgmpnenggpjbcbm/images/beta_extension_icon_128.png", "bhbcbkonalnjkflmdkdodieehnmmeknp/assets/css/common.css", "jlipcaflaocihnmlhnhcfombgmmfglho/content/integrations/search/popup.html", "ngcdedagijmjiaoihedckijmghblhgal/style.css", "hlkiignknimkfafapmgpbnbnmkajgljh/assets/128x128.png", "lmfbagjnfegjafocookgkkjedmmojopj/js/lib/jquery-2.1.4.js", "hfadalcgppcbffdnichplalnmhjbabbm/template/2faLogin.html", "iobcbdgacfkninlcbphihhdlkobkehia/javascripts/jquery-1.4.4.js", "gdojjgflncpbcfmenbkndfhoamlhajmf/ScreenShot.png", "mipimgcmndeggldjcbjfeogcpoafomhl/css/drawer.css", "mpkodccbngfoacfalldjimigbofkhgjn/js/magnet.js", "fbkejdngkadphfgbmmhdcjcdemkjcnco/wamessages.js", "clkoagfbjkilljcajbbielofkeokbhma/src/content/inject.css", "ponjkmladgjfjgllmhnkhgbgocdigcjm/views/embed.html", "edoadhjjfgeniilpmnoaddaihjkkhheb/img/01.png", "fiedbfgcleddlbcmgdigjgdfcggjcion/content_scripts/passwordsdropdown.html", "aeachknmefphepccionboohckonoeemg/./popup.html", "hdfadhmdfllnfbckdhiikebblicdggbb/assets/images/download2.png", "aohlfneeliakfcefeffppfplagbccbni/img/close.svg", "efbjojhplkelaegfbieplglfidafgoka/icons/vt-logo.svg", "oanhbddbfkjaphdibnebkklpplclomal/images/icon.png", "beejegoimbgpafoobegjmhjnehlmnbcn/content/hook.js", "gjcgfkhgpaccjpjokgpekpgpphgaanej/_locales/en/messages.json", "mjidkpedjlfnanainpdfnedkdlacidla/image/u.png", "cnaibnehbbinoohhjafknihmlopdhhip/images/app-gmail.png", "ipghnlmkjdejhibmialipjeaoobhaofe/javascripts/background.js", "lmmpgfjnchldhcieiiegcpdmaidkaanb/shared/images/test.png", "iblenkmcolcdonmlfknbpbgjebabcoae/images/icon128.png", "ipkfnchcgalnafehpglfbommidgmalan/css/base.css", "mbaanpgkpkoamihninlcegnjclcpibde/views/sidebar_template.html", "nhnkbkgjikgcigadomkphalanndcapjk/inpage.js", "jnpfnacconjipomhfkphknjfmcnhagpb/icon48.png", "mjmabgdoainclinjecbkdancpamdiaih/massUpload.js", "pbnndmlekkboofhnbonilimejonapojg/js/page-script.js", "hfgbpkkdodfihabamnkhoaeamkdhnoec/app/ui/ui.html", "okembgocccnjoiaafmdedmhodcoalbgg/icon-small-128.png", "nhdelomnagopgaealggpgojkhcafhnin/lib/jquery-2.1.0.min.map", "hcbgadmbdkiilgpifjgcakjehmafcjai/img/bullets/bullet-amber-alt.png", "mgpdnhlllbpncjpgokgfogidhoegebod/resources/photoShowIcons.woff2", "ceipnlhmjohemhfpbjdgeigkababhmjc/options.html", "hkdppjhidnnlojafjpbcgbcgcgjagbdl/images/icon_128.png", "obcbigljfpgappaaofailjjoabiikckk/html/statusbar.html", "hjlgbdmfljafjdkpgdiefkplpkcjlphh/js/static/regions.js", "ofokfnlmkfghjcmppfopibknmlhadhbm/popup.html", "ncbhkghndhoddmbfgddpgafhbnijdadj/popup/popup.css", "ojnikmlgjpfiogeijjkpeakbedjhjcch/popup.html", "fpkknkljclfencbdbgkenhalefipecmb/generated/axs.js", "gfgkebiommjpiaomalcbfefimhhanlfd/static/touch-emulator.js", "hpfmedbkgaakgagknibnonpkimkibkla/assets/AccountOwnerButton.png", "gfdcgfhkelkdmglklfbndgopaihmoeci/img/128.png", "edkljafinkpeoglndilllgfnailhkocn/js/overideDefaultUserMedia.js", "dkmcogkicmeikokodpohkibiicngdhln/images/arrow_down.svg", "jcnfkjjanbdfabigknbedgkfjkljhbdn/img/csv.png", "lnkgcmpjkkkeffambkllliefdpjdklmi/slds/assets/fonts/webfonts/SalesforceSans-Bold.eot", "dheionainndbbpoacpnopgmnihkcmnkl/icons/icon128.png", "gfgpkepllngchpmcippidfhmbhlljhoo/README.md", "djkbihbnjhkjahbhjaadbepppbpoedaa/html/app.html", "idhghjodolinkdhibgfgfoceackpcjfl/img/128x128.png", "gbilbeoogenjmnabenfjfoockmpfnjoh/data/content_script/inject.css", "lllggmgeiphnciplalhefnbpddbadfdi/success.html", "kfhkikpdmehlpkaiplafjkaicdljldcf/facecam.html", "eeeningnfkaonkonalpcicgemnnijjhn/icon_48.png", "odfonlkabodgbolnmmkdijkaeggofoop/_locales/en/messages.json", "lojdmgdchjcfnmkmodggbaafecagllnh/options.html", "hlepfoohegkhhmjieoechaddaejaokhf/resolve-conflicts.js", "anbfhidldjknonaihbalghlebaijealk/html/options.html", "ljbmkjikheoaglnnifnghjbknejbmhap/assets/css/menu.css", "dndehlekllfkaijdlokmmicgnlanfjbi/res/img/settings/bg_random2.png", "kiokdhlcmjagacmcgoikapbjmmhfchbi/css/optionStyle.css", "jpchabeoojaflbaajmjhfcfiknckabpo/includes/inject.js", "bcnccmamhmcabokipgjechdeealcmdbe/app/index.html", "haafibkemckmbknhfkiiniobjpgkebko/index.html", "adelhekhakakocomdfejiipdnaadiiib/imgs/bg/bg_blank_1px.png", "abfimpkhacgimamjbiegeoponlepcbob/assets/jquery-3.3.1.min.js", "dkndmhgdcmjdmkdonmbgjpijejdcilfh/lib/gif.worker.js", "knkmhklfleegnlkapphbjbjnbilijlhf/css/style.css", "phimhnckkaofkllcoledjilakgbeohli/pages/static/Lato/Lato-Hairline.ttf", "egnjhciaieeiiohknchakcodbpgjnchh/img/icon48.png", "fnbkeopcpjainobjebddfcnnknmfipid/jq.js", "pdadlkbckhinonakkfkdaadceojbekep/images/record.png", "gjnmclkoadjdljnfmbnnhaahilafoeji/logo128.png", "ijcpiojgefnkmcadacmacogglhjdjphj/data/transphobic.dat", "epnkgfaomnlopilnejhgndcilhlimndd/icon128.png", "ldidobiipljjgfaglokcehmiljadanle/images/ajax-loader.gif", "fffiogeaioiinfekkflcfebaoiohkkgp/css/content.css", "amkmjjmmflddogmhpjloimipbofnfjih/dropbox.html", "fccdiabakoglkihagkjmaomipdeegbpk/skin/blue.png", "ogmnaimimemjmbakcfefmnahgdfhfami/popup.html", "bhnkonnaaipkhoaiakbcpcaolflgmnhl/src/resources/styles/main.css", "jpefmbpcbebpjpmelobfakahfdcgcmkl/assets/static/128.png", "mfldbojpjpgjlphijlbgefdjebkhdjom/comms/comms.js", "gcjpefhffmcgplgklffgbebganmhffje/images/message48.png", "boapjdphamdkfjfdibbdpcemcdncfhjf/modal.html", "pakknklefcjdhejnffafpeelofiekebg/html/popup.html", "ibpbagbedfnlepijbnjeanihpoohkocm/javascripts/background.js", "nknojfclnachdkpdkjbbhbkgpnladhnj/javascripts/background.js", "mgbkojamndckbfmhlgcfoopaljhhmckh/assets/avatar.css", "oghkljobbhapacbahlneolfclkniiami/index.html", "ecaieeiecbdhkcgknidmfelflleobbnp/assets/add-dates@2x.png", "eciepnnimnjaojlkcpdpcgbfkpcagahd/content.bundle.js", "elfaihghhjjoknimpccccmkioofjjfkf/assets/static/icon-128.png", "deamobbcdpcfhkiepmjicnlheiaalbbe/manifest.json", "oanlehpljgeknlohgbakodejdbingjpj/assets/css/common.css", "cakejefemdjbmhdjkjhibjhmhgjefidm/js/content.js", "adanomdlalebngcphfbknoglbcdcbchb/chunks/utils-a5b09840.js", "ndgklmlnheedegipcohgcbjhhgddendc/ext-content/gdocs-early.js", "hicfolagolebmjahkldfohbmphcoddoh/img/100.png", "fdnipcdebaagjpicpbkildmcefflobhn/img/128.png", "glgaegbgegomicnedooifcbnmppmofkf/javascripts/background.js", "aaebjepcfidgkojljbgoilgkgklehldj/manifest.json", "kdoofkpcjhkbhedgkdbagobockcmeoeb/content.min.css", "lagdcjmbchphhndlbpfajelapcodekll/worker_proxy.html", "johejpedmdkeiffkdaodgoipdjodhlld/content.styles.css", "mbehpgfjageeapmbabpkdlcmdkggabal/grid.user.js", "pbmlfaiicoikhdbjagjbglnbfcbcojpj/prefs/edit.html", "apcnhnfabpjbhehcnlebhdpidhmdhlon/html/Background.html", "lpgajkhkagnpdjklmpgjeplmgffnhhjj/images/certified.png", "lnddbhdmiciimpkbilgpklcglkdegdkg/js/app.bbbd068e.js", "mihdfbecejheednfigjpdacgeilhlmnf/assets/simple-line-icons.css", "pppfmbnpgflleackdcojndfgpiboghga/images/icon128.png", "cgajiilhmpfemmdihjnodpibaffakjhj/design/assets/slid_desktop_icon.png", "apacadmkljmohmjgefhficgiijnnmelk/extension.png", "peocghcbolghcodidjgkndgahnlaecfl/assets/css/content.css", "chmaghefgehniobggcaloeoibjmbhfae/libs/jquery-3.4.1.min.js", "fkceepiaefcdabdbnecamhdgkjenghkk/2048.png", "ddehdnnhjimbggeeenghijehnpakijod/images/defaults/up.png", "iebboopaeangfpceklajfohhbpkkfiaa/deluminate.css", "bbeaicapbccfllodepmimpkgecanonai/src/scripts/inject.js", "dibjpgjiefaibdinijeddhaiiphfhejp/javascripts/background.js", "lfijgegefgcgbfcgjgnhnkclenhfijhk/img/black-friday-logo-570x326.gif", "kkicgcijebblepmephnfganiiochecfl/src/mooc.js", "lholmjphdehllbpdoiejoolbejkjcpba/assets/css/collection-box.css", "fedimamkpgiemhacbdhkkaihgofncola/img/iconMenuItem24.png", "ghahcnmfjfckcedfajbhekgknjdplfcl/icons/32x32.png", "kicpmhgmcajloefloefojbfdmenhmhjf/content/html/compare.html", "ahmapmilbkfamljbpgphfndeemhnajme/annotation.html", "ifjafammaookpiajfbedmacfldaiamgg/chrome-utils.js", "bngfikljchleddkelnfgohdfcobkggin/options.html", "ickcnpogpccagkhpcmibbkmdlnhiepda/assets/css/alertify.css", "ckoglchhifaedlfjhnoaebnloipiepjg/javascripts/background.js", "bmdblncegkenkacieihfhpjfppoconhi/scripts/in-page-script.js", "pbcpfbcibpcbfbmddogfhcijfpboeaaf/assets/images/icon-context.png", "iccjgbbjckehppnpajnmplcccjcgbdep/index.html", "fglmkdhomaklnckgbjfnfmbfmlkjippg/options.html", "fcgbopaomlpldhbinhgebmkcnkfconmn/inject.html", "hdlajobndamjlloioebnannnlbopndee/content.styles.css", "hpmbiinljekjjcjgijnlbmgcmoonclah/images/close_btn.png", "aaiolimgbncdaldgbbjkidiijidchhjo/images/account-active.svg", "debnnjfbneojbmioajinefnflopdohjk/skin/checkbox_off.png", "kbmipnjdeifmobkhgogdnomkihhgojep/images/shareaholic_button_230_bw.png", "ejkaocphofnobjdedneohbbiilggdlbi/static/assets/connection_button/connected.png", "oncaapliomaamlbopdmhmdompfemljhm/_locales/ar/messages.json", "okphadhbbjadcifjplhifajfacbkkbod/images/sab2_16_fetching.png", "mhfbofiokmppgdliakminbgdgcmbhbac/tool.html", "egikgfbhipinieabdmcpigejkaomgjgb/images/icon128.png", "empjidjbllcmlgaobahepkijkfmfkjdb/Icon-512.png", "gipnlpdeieaidmmeaichnddnmjmcakoe/img/folder.png", "bphagiicbkoknlhmmbiokkdobkiglpio/assets/icon.png", "lkjffochdceoneajnigkbdddjdekhojj/data/kanjimini.json", "egclcjdpndeoioimlbbbmdhcaopnedkp/images/Slice1.png", "gcfcpohokifjldeandkfjoboemihipmb/images/transparent.gif", "ecldhagehndokdmaiaigoaecbmbnmfkc/images/next_1.png", "ngghlnfmdgnpegcmbpgehkbhkhkbkjpj/popup.html", "nikccehomlnjkmgmhnieecolhgdafajb/public/actionPage/document.load.js", "dadggmdmhmfkpglkfpkjdmlendbkehoh/inject-scripts/searchvideos.js", "dijhcpbkalfgkcebgoncjmfpbamihgaf/js-lib/inject-scripts/dly-gmail.js", "lkpekgkhmldknbcgjicjkomphkhhdkjj/images/logo.svg", "bjdhcabjnhhifipbnopnfpfidkafanjf/js/inject.js", "ecgllillhilocegdanfdmbfnjonmhpie/icon/back.png", "mibmplgflabdmnnoncnedjfdpidjblnk/jquery.min.js", "dbpjfmehfpcgmlpfnfilcnhbckmecmca/simkl-oauth.html", "ohmpcdmgbjhkhnljkaeeahndchboiici/_locales/en/messages.json", "cihaednhfbocfdiflmpccekcmjepcnmb/fiframe.html", "egpachgbfnbpkceigfpcpicekmiehame/css/extraDownload.css", "ekpipjofdicppbepocohdlgenahaneen/js/inject/hoopla_inject.js", "eibnkkenjjeaadmjkngfincfnapgpeao/fonts/element-icons.ttf", "fcbnhmalionocfajdkpnlhmekghnmbii/jquery.qtip.custom/jquery.qtip.min.css"],
    Dp = function() {
      function e() {
        Kc(this, e), this.raphaelInfo = {}
      }
      var n;
      return tl(e, [{
        key: "setCustomFields",
        value: function(e, n) {
          var t = this;
          null === e && null === n || [e, n].forEach(function(e, n) {
            "object" !== ja(e) || _.isArray(e) ? t.raphaelInfo[n ? "e5" : "e1"] = Q.PARA_ERR : "{}" === B(e) || null === e ? t.raphaelInfo[n ? "e5" : "e1"] = Q.EMPTY : t.raphaelInfo[n ? "e5" : "e1"] = 2048 < B(e).length ? Q.VALUE_LONG : e
          })
        }
      }, {
        key: "addInfo",
        value: function(e, n) {
          this.raphaelInfo[e] = n
        }
      }, {
        key: "collect",
        value: function() {
          var e, n, t, i = this,
            a = (S.initTokenTimeoutReason = ps.syncCollecting, _.now()),
            o = {};
          for (e in _p) Object.prototype.hasOwnProperty.call(_p, e) && (n = _p[e], t = _.now(), this.raphaelInfo[e] = n(), o[e] = _.now() - t);
          return this.raphaelInfo.j81 = o, S.initTokenTimeoutReason = ps.asyncCollecting, new w(function(o) {
            var n;
            w.all([Fp(), Gp(), Yp(), Wp(), (n = _.now(), new w(function(o) {
              var e = _.getFromLocalStorage(T.DVJ85);
              if (e) return o({
                hash: e,
                count: Q.DEFAULT,
                timeSpent: _.now() - n
              });
              new w(function(o) {
                var e, n;
                Hp ? function(r) {
                  var e, c, l = _.now(),
                    n = new w(function(e) {
                      return c = e
                    }),
                    s = Bg(e = Array(r.length)).call(e, 0),
                    g = 0,
                    f = ["monospace", "sans-serif", "serif"],
                    t = "mmmmmmmmmmlli",
                    o = "72px",
                    h = document.getElementsByTagName("body")[0],
                    p = document.createElement("div"),
                    A = document.createElement("div"),
                    d = {},
                    m = {},
                    u = function() {
                      var e = document.createElement("span");
                      return e.style.position = "absolute", e.style.left = "-9999px", e.style.fontSize = o, e.style.fontStyle = "normal", e.style.fontWeight = "normal", e.style.letterSpacing = "normal", e.style.lineBreak = "auto", e.style.lineHeight = "normal", e.style.textTransform = "none", e.style.textAlign = "left", e.style.textDecoration = "none", e.style.textShadow = "none", e.style.whiteSpace = "normal", e.style.wordBreak = "normal", e.style.wordSpacing = "normal", e.innerText = t, e
                    },
                    i = function() {
                      for (var e = [], n = 0, t = f.length; n < t; n++) {
                        var o = u();
                        o.style.fontFamily = f[n], p.appendChild(o), e.push(o)
                      }
                      return e
                    }();
                  h.appendChild(p);
                  for (var a = 0, b = f.length; a < b; a++) d[f[a]] = i[a].offsetWidth, m[f[a]] = i[a].offsetHeight;
                  h.appendChild(A);
                  var k = _.now();
                  return function e() {
                    if (g >= r.length) {
                      try {
                        h.removeChild(A), h.removeChild(p)
                      } catch (e) {}
                      return c([s, _.now() - l])
                    }
                    for (var n, t, o = 0; o < f.length; o++) {
                      var i = f[o],
                        a = (a = r[g], n = i, t = void 0, (t = u()).style.fontFamily = "'" + a + "'," + n, t);
                      if (A.appendChild(a), a.offsetWidth !== d[i] || a.offsetHeight !== m[i]) {
                        s[g] = 1, A.removeChild(a);
                        break
                      }
                      A.removeChild(a)
                    }
                    g++, 10 < _.now() - k ? requestAnimationFrame(function() {
                      k = _.now(), e()
                    }) : e()
                  }(), n
                }(Sp).then(function(e) {
                  var e = tg(e, 2),
                    n = e[0],
                    e = e[1],
                    t = [];
                  n.forEach(function(e, n) {
                    e && t.push(Sp[n])
                  }), o({
                    result: t,
                    spent: Vp = e
                  })
                }) : (e = _.now(), n = function() {
                  if (qp) return qp;
                  var s = ["monospace", "sans-serif", "serif"],
                    g = Sp,
                    n = "mmmmmmmmmmlli",
                    t = "72px",
                    e = document.getElementsByTagName("body")[0],
                    i = document.createElement("div"),
                    f = document.createElement("div"),
                    o = {},
                    a = {},
                    h = function() {
                      var e = document.createElement("span");
                      return e.style.position = "absolute", e.style.left = "-9999px", e.style.fontSize = t, e.style.fontStyle = "normal", e.style.fontWeight = "normal", e.style.letterSpacing = "normal", e.style.lineBreak = "auto", e.style.lineHeight = "normal", e.style.textTransform = "none", e.style.textAlign = "left", e.style.textDecoration = "none", e.style.textShadow = "none", e.style.whiteSpace = "normal", e.style.wordBreak = "normal", e.style.wordSpacing = "normal", e.innerText = n, e
                    },
                    r = function() {
                      for (var e = [], n = 0, t = s.length; n < t; n++) {
                        var o = h();
                        o.style.fontFamily = s[n], i.appendChild(o), e.push(o)
                      }
                      return e
                    }();
                  e.appendChild(i);
                  for (var c = 0, l = s.length; c < l; c++) o[s[c]] = r[c].offsetWidth, a[s[c]] = r[c].offsetHeight;
                  for (var p = function() {
                    for (var e, n, t = {}, o = 0, i = g.length; o < i; o++) {
                      for (var a = [], r = 0, c = s.length; r < c; r++) {
                        l = g[o], e = s[r], n = void 0, (n = h()).style.fontFamily = "'" + l + "'," + e;
                        var l = n;
                        f.appendChild(l), a.push(l)
                      }
                      t[g[o]] = a
                    }
                    return t
                  }(), A = (e.appendChild(f), []), d = 0, m = g.length; d < m; d++) ! function(e) {
                    for (var n = !1, t = 0; t < s.length; t++)
                      if (n = e[t].offsetWidth !== o[s[t]] || e[t].offsetHeight !== a[s[t]]) return n;
                    return n
                  }(p[g[d]]) || A.push(g[d]);
                  return e.removeChild(f), e.removeChild(i), qp = A
                }(), Vp = _.now() - e, o({
                  result: n,
                  spent: Vp
                }))
              }).then(function(e) {
                var n = e.result,
                  t = _.MD5(B(n));
                _.setLocalStorage(T.DVJ85, t), o({
                  hash: t,
                  count: n.length,
                  timeSpent: e.spent || 0
                })
              })
            })), new w(function(n) {
              os(function() {
                n({
                  success: !1,
                  result: ""
                })
              }, 1e4);
              var e = 1;
              try {
                e = Math.max(1, Math.min(10, Math.floor(navigator.hardwareConcurrency / 2)))
              } catch (e) {}
              for (var t = 0, o = [], i = 0; i < e && "break" !== function() {
                var i = t,
                  a = Math.min(i + Math.round(Tp.length / e), Tp.length);
                if (a <= i) return "break";
                o.push(new w(function(n) {
                  try {
                    var e = new Blob(["const extensionList=".concat(B(Tl(Tp).call(Tp, i, a)), ";\n") + "/* eslint-disable no-undef */\nconst promiseAll = [];\nextensionList.forEach(item => {\npromiseAll.push(new Promise(resolve => {\nfetch('chrome-extension:/' + '/' + item).then((response) => { \nif (response.ok) {\nresolve(true);\n} else {\nresolve(false);\n}\n}).catch((error) => {\nresolve(false);\n});\n}));\n});\nPromise.all(promiseAll).then(res => {\npostMessage({\nkey: 'extensionReportResult',\nresult: res\n});\n});"]),
                      t = Qp.createObjectURL(e),
                      o = new Worker(t);
                    o.onmessage = function(e) {
                      e && e.data && "object" == ja(e.data) && "extensionReportResult" == e.data.key && Array.isArray(e.data.result) && (n(e.data.result), o.terminate())
                    }
                  } catch (e) {}
                })), t = a
              }(); i++);
              w.all(o).then(function(e) {
                e = ms(e = sf(e).call(e, 1)).call(e, function(e) {
                  return e ? 1 : 0
                });
                n({
                  success: !0,
                  result: function(e) {
                    var n = Math.ceil(e.length / 6),
                      t = 0;
                    t = n % 4 ? n + (4 - n % 4) : n + 0;
                    for (var o = Bg(t = Array(t)).call(t, 0), i = (e.forEach(function(e, n) {
                      return o[Math.floor(n / 6)] += e * Math.pow(2, 5 - n % 6)
                    }), ""), a = 0; a < n; a++) {
                      var r = o[a];
                      i += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [r]
                    }
                    n % 4 == 1 ? i += "A==" : n % 4 == 2 ? i += "A=" : n % 4 == 3 && (i += "A");
                    return i
                  }(e)
                })
              })
            })]).then(function(e) {
              i.raphaelInfo.j50 = e[0];
              var n = e[1],
                t = (i.raphaelInfo.j49 = e[2], i.raphaelInfo.j77 = e[3], e[4]),
                e = e[5];
              i.raphaelInfo.j85 = t.hash, i.raphaelInfo.j84 = t.count, i.raphaelInfo.j81.j85 = t.timeSpent, i.raphaelInfo.j81.j84 = t.timeSpent, e.success && (i.raphaelInfo.j86 = e.result), "object" === ja(n) && "candidate" in n && "localDescription" in n ? (i.raphaelInfo.j70 = n.localDescription, i.raphaelInfo.j71 = n.candidate) : (i.raphaelInfo.j70 = n, i.raphaelInfo.j71 = n), i.raphaelInfo.j66 = _.now() - a + "", S.initTokenTimeoutReason = ps.collectionDone, o()
            })
          })
        }
      }, {
        key: "getRaphaelInfoForZhengdao",
        value: (n = Wc(is.mark(function e() {
          var n = this;
          return is.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
              case 0:
                if (this.raphaelInfo.d15) {
                  e.next = 3;
                  break
                }
                return e.next = 3, this.collect();
              case 3:
                if (this.raphaelInfo.v1 == Q.EMPTY) return e.next = 6, _.waituntil(function() {
                  return Ts() != Q.EMPTY && Qs() != Q.EMPTY && (n.raphaelInfo.v1 = Ts(), n.raphaelInfo.v3 = Qs(), !0)
                }, 100, og);
                e.next = 6;
                break;
              case 6:
                return e.abrupt("return", JSON.parse(B(this.raphaelInfo)));
              case 7:
              case "end":
                return e.stop()
            }
          }, e, this)
        })), function() {
          return n.apply(this, arguments)
        })
      }, {
        key: "getValueForField",
        value: function(i) {
          return "j50" == i ? Fp() : "j49" == i ? Yp() : "j77" == i ? Wp() : new w(function(n, t) {
            var o;
            if ("j70" == i || "j71" == i) return o = {
              j70: "localDescription",
              j71: "candidate"
            }, void Gp().then(function(e) {
              "object" != ja(e) ? t(e) : o[i] in e ? n(e[o[i]]) : t(Q.NOT_SUPPORT)
            });
            i in _p ? n(_p[i]()) : t(Q.NOT_SUPPORT)
          })
        }
      }]), e
    }(),
    _p = {
      d15: function() {
        return "web"
      },
      v1: Ts,
      v2: function() {
        return S.VERSION
      },
      v13: function() {
        var e;
        return S.dvLastDecryptErrCode && "number" == typeof S.dvLastDecryptErrCode ? S.dvLastDecryptErrCode : (e = parseInt(_.getFromLocalStorage(T.DVDecryptErrCode)), isNaN(e) ? 0 : e)
      },
      v3: Qs,
      j1: function() {
        try {
          if (navigator) return {
            name: navigator.appName,
            version: navigator.appVersion,
            code: navigator.appCodeName,
            Agent: navigator.userAgent
          };
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j2: function() {
        try {
          if (!navigator) throw "";
          var e = navigator.plugins;
          if (e) {
            for (var n = [], t = 0, o = e.length; t < o; t++) {
              var i = {
                name: e[t].name,
                filename: e[t].filename,
                description: e[t].description,
                version: e[t].version || ""
              };
              n.push(i)
            }
            return n
          }
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j3: function() {
        try {
          return window.location.href
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j4: function() {
        return document.referrer
      },
      j5: xp,
      j6: Np,
      j7: function() {
        return window.screen.colorDepth
      },
      j8: function() {
        try {
          if (navigator) return "onLine" in navigator ? navigator.onLine : Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j10: function() {
        try {
          if (navigator) return navigator.language || Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j11: function() {
        try {
          if (navigator) return navigator.languages || Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j12: function() {
        try {
          if (navigator) return navigator.platform ? navigator.platform.toLowerCase() : Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j15: function() {
        return (new Date).getTimezoneOffset() / 60
      },
      j16: function() {
        return _.now()
      },
      j17: function() {
        var e = 0,
          n = 0;
        try {
          var t, o;
          document.all ? (t = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) && (e = 1, n = t.GetVariable("$version")) : navigator.plugins && 0 < navigator.plugins.length && ((o = navigator.plugins["Shockwave Flash"]) && (e = 1, n = o.description))
        } catch (e) {}
        return {
          hasFlash: e,
          version: n
        }
      },
      j18: function() {
        var e = !1;
        if (navigator.cookieEnabled) return !0;
        document.cookie = "dvTest=yes;";
        var n = document.cookie; - 1 < D(n).call(n, "dvTest=yes") && (e = !0);
        n = new Date;
        return n.setTime(n.getTime() - 6e4), document.cookie = ";expires=" + n.toUTCString(), e
      },
      j34: function() {
        var e = _.getFromLocalStorage(T.DVJ34);
        if (e) return Hp = "2466.781" == _.getFromLocalStorage(T.DVLowPerformance), e;
        var e = _.now(),
          n = function() {
            try {
              return Jp() ? _.MD5(function() {
                var e = [],
                  n = document.createElement("canvas"),
                  t = (n.width = 2e3, n.height = 200, n.style.display = "inline", n.getContext("2d"));
                t.rect(0, 0, 10, 10), t.rect(2, 2, 6, 6), e.push("canvas winding:" + (!1 === t.isPointInPath(5, 5, "evenodd") ? "yes" : "no")), t.textBaseline = "alphabetic", t.fillStyle = "#f60", t.fillRect(125, 1, 62, 20), t.fillStyle = "#069", t.font = "11pt no-real-font-123", t.fillText("Cwm fjordbank glyphs vext quiz, 😃", 2, 15), t.fillStyle = "rgba(102, 204, 0, 0.2)", t.font = "18pt Arial", t.fillText("Cwm fjordbank glyphs vext quiz, 😃", 4, 45), t.globalCompositeOperation = "multiply", t.fillStyle = "rgb(255,0,255)", t.beginPath(), t.arc(50, 50, 50, 0, 2 * Math.PI, !0), t.closePath(), Bg(t).call(t), t.fillStyle = "rgb(0,255,255)", t.beginPath(), t.arc(100, 50, 50, 0, 2 * Math.PI, !0), t.closePath(), Bg(t).call(t), t.fillStyle = "rgb(255,255,0)", t.beginPath(), t.arc(75, 100, 50, 0, 2 * Math.PI, !0), t.closePath(), Bg(t).call(t), t.fillStyle = "rgb(255,0,255)", t.arc(75, 75, 75, 0, 2 * Math.PI, !0), t.arc(75, 75, 25, 0, 2 * Math.PI, !0), Bg(t).call(t, "evenodd"), n.toDataURL && e.push("canvas fp:" + n.toDataURL());
                return e.join(",")
              }()) : Q.NOT_SUPPORT
            } catch (e) {
              return Q.EXCEPTION
            }
          }(),
          e = _.now() - e;
        return Hp = 300 < e, _.setLocalStorage(T.DVJ34, n), _.setLocalStorage(T.DVLowPerformance, Hp ? "2446.781" : "1830"), n
      },
      j35: function() {
        var e = _.getFromLocalStorage(T.DVJ35);
        if (e) return e;
        if (Hp) return Q.EMPTY;
        e = function() {
          try {
            var e;
            return Jp() ? null == (e = function() {
              var a = Lp();
              if (!a) return null;

              function e(e) {
                return a.clearColor(0, 0, 0, 1), a.enable(a.DEPTH_TEST), a.depthFunc(a.LEQUAL), a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT), "[" + e[0] + ", " + e[1] + "]"
              }
              var r = [],
                n = a.createBuffer(),
                t = (a.bindBuffer(a.ARRAY_BUFFER, n), new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0])),
                t = (a.bufferData(a.ARRAY_BUFFER, t, a.STATIC_DRAW), n.itemSize = 3, n.numItems = 3, a.createProgram()),
                o = a.createShader(a.VERTEX_SHADER),
                i = (a.shaderSource(o, "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}"), a.compileShader(o), a.createShader(a.FRAGMENT_SHADER));
              a.shaderSource(i, "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}"), a.compileShader(i), a.attachShader(t, o), a.attachShader(t, i), a.linkProgram(t), a.useProgram(t), t.vertexPosAttrib = a.getAttribLocation(t, "attrVertex"), t.offsetUniform = a.getUniformLocation(t, "uniformOffset"), a.enableVertexAttribArray(t.vertexPosArray), a.vertexAttribPointer(t.vertexPosAttrib, n.itemSize, a.FLOAT, !1, 0, 0), a.uniform2f(t.offsetUniform, 1, 1), a.drawArrays(a.TRIANGLE_STRIP, 0, n.numItems);
              try {
                var c = a.canvas;
                r.push(c.toDataURL())
              } catch (e) {}
              r.push("extensions:" + (a.getSupportedExtensions() || []).join(";")), r.push("webgl aliased line width range:" + e(a.getParameter(a.ALIASED_LINE_WIDTH_RANGE))), r.push("webgl aliased point size range:" + e(a.getParameter(a.ALIASED_POINT_SIZE_RANGE))), r.push("webgl alpha bits:" + a.getParameter(a.ALPHA_BITS)), r.push("webgl antialiasing:" + (a.getContextAttributes().antialias ? "yes" : "no")), r.push("webgl blue bits:" + a.getParameter(a.BLUE_BITS)), r.push("webgl depth bits:" + a.getParameter(a.DEPTH_BITS)), r.push("webgl green bits:" + a.getParameter(a.GREEN_BITS)), r.push("webgl max anisotropy:" + function(e) {
                var n = e.getExtension("EXT_texture_filter_anisotropic") || e.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || e.getExtension("MOZ_EXT_texture_filter_anisotropic");
                return n ? 0 === (e = e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) ? 2 : e : null
              }(a)), r.push("webgl max combined texture image units:" + a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS)), r.push("webgl max cube map texture size:" + a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE)), r.push("webgl max fragment uniform vectors:" + a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS)), r.push("webgl max render buffer size:" + a.getParameter(a.MAX_RENDERBUFFER_SIZE)), r.push("webgl max texture image units:" + a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS)), r.push("webgl max texture size:" + a.getParameter(a.MAX_TEXTURE_SIZE)), r.push("webgl max varying vectors:" + a.getParameter(a.MAX_VARYING_VECTORS)), r.push("webgl max vertex attribs:" + a.getParameter(a.MAX_VERTEX_ATTRIBS)), r.push("webgl max vertex texture image units:" + a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS)), r.push("webgl max vertex uniform vectors:" + a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS)), r.push("webgl max viewport dims:" + e(a.getParameter(a.MAX_VIEWPORT_DIMS))), r.push("webgl red bits:" + a.getParameter(a.RED_BITS)), r.push("webgl renderer:" + a.getParameter(a.RENDERER)), r.push("webgl shading language version:" + a.getParameter(a.SHADING_LANGUAGE_VERSION)), r.push("webgl stencil bits:" + a.getParameter(a.STENCIL_BITS)), r.push("webgl vendor:" + a.getParameter(a.VENDOR)), r.push("webgl version:" + a.getParameter(a.VERSION));
              try {
                var l = a.getExtension("WEBGL_debug_renderer_info");
                l && (r.push("webgl unmasked vendor:" + a.getParameter(l.UNMASKED_VENDOR_WEBGL)), r.push("webgl unmasked renderer:" + a.getParameter(l.UNMASKED_RENDERER_WEBGL)))
              } catch (e) {}
              return a.getShaderPrecisionFormat && ["FLOAT", "INT"].forEach(function(i) {
                ["VERTEX", "FRAGMENT"].forEach(function(o) {
                  ["HIGH", "MEDIUM", "LOW"].forEach(function(t) {
                    ["precision", "rangeMin", "rangeMax"].forEach(function(e) {
                      var n = a.getShaderPrecisionFormat(a[o + "_SHADER"], a[t + "_" + i])[e],
                        e = ("precision" !== e && (e = "precision " + e), ["webgl ", o.toLowerCase(), " shader ", t.toLowerCase(), " ", i.toLowerCase(), " ", e, ":", n].join(""));
                      r.push(e)
                    })
                  })
                })
              }), Mp(a), r
            }()) ? Q.EXCEPTION : _.MD5(B(e)) : Q.NOT_SUPPORT
          } catch (e) {
            return Q.EXCEPTION
          }
        }();
        return _.setLocalStorage(T.DVJ35, e), e
      },
      j36: function() {
        try {
          return !!window.indexedDB
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j37: function() {
        try {
          return !!window.sessionStorage
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j38: function() {
        try {
          return !!window.localStorage
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j39: function() {
        try {
          if (navigator && navigator.hardwareConcurrency) return navigator.hardwareConcurrency;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j40: function() {
        try {
          if (navigator) return N.cpuClass || Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j41: function() {
        try {
          if (navigator) return N.deviceMemory || Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j42: Pp,
      j43: Up.bind(window, "height"),
      j44: Up.bind(window, "width"),
      j45: Up.bind(window, "top"),
      j46: Up.bind(window, "left"),
      j51: function() {
        try {
          if (navigator && navigator.javaEnabled) return navigator.javaEnabled();
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j52: function() {
        try {
          if (navigator) return navigator.doNotTrack || N.msDoNotTrack || Rp.doNotTrack || Q.NOT_SUPPORT;
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j53: function() {
        var n, e = 0;
        void 0 !== navigator.maxTouchPoints ? e = navigator.maxTouchPoints : void 0 !== N.msMaxTouchPoints && (e = N.msMaxTouchPoints);
        try {
          document.createEvent("TouchEvent"), n = !0
        } catch (e) {
          n = !1
        }
        var t = "ontouchstart" in window;
        return [e, n, t]
      },
      j54: function() {
        var e = document.createElement("div"),
          n = (e.innerHTML = "&nbsp;", e.className = "adsbox", !1);
        try {
          document.body.appendChild(e);
          var t = document.getElementsByClassName("adsbox")[0];
          n = 0 === t.offsetHeight, document.body.removeChild(e)
        } catch (e) {
          n = !1
        }
        return n
      },
      j55: function() {
        try {
          if (navigator) return "Microsoft Internet Explorer" === navigator.appName || !("Netscape" !== navigator.appName || !/Trident/.test(navigator.userAgent));
          throw ""
        } catch (e) {}
        return Q.NOT_SUPPORT
      },
      j56: function() {
        return void 0 !== Rp.swfobject
      },
      j57: function() {
        try {
          if (navigator && void 0 !== navigator.languages) try {
            if (navigator.languages[0].substr(0, 2) !== navigator.language.substr(0, 2)) return !0
          } catch (e) {
            return !0
          }
        } catch (e) {}
        return !1
      },
      j58: function() {
        var e = [window.screen.availWidth, window.screen.availHeight],
          n = (kg(e).call(e).reverse(), [window.screen.width, window.screen.height]);
        return kg(n).call(n).reverse(), n[0] < e[0] || n[1] < e[1]
      },
      j59: Op,
      j60: function() {
        return function() {
          var e = navigator.userAgent.toLowerCase(),
            n = navigator.productSub; {
            if (0 <= D(e).call(e, "edge/") || 0 <= D(e).call(e, "iemobile/")) return !1;
            if (0 <= D(e).call(e, "opera mini")) return !1;
            e = 0 <= D(e).call(e, "firefox/") ? "Firefox" : 0 <= D(e).call(e, "opera/") || 0 <= D(e).call(e, " opr/") ? "Opera" : 0 <= D(e).call(e, "chrome/") ? "Chrome" : 0 <= D(e).call(e, "safari/") ? 0 <= D(e).call(e, "android 1.") || 0 <= D(e).call(e, "android 2.") || 0 <= D(e).call(e, "android 3.") || 0 <= D(e).call(e, "android 4.") ? "AOSP" : "Safari" : 0 <= D(e).call(e, "trident/") ? "Internet Explorer" : "Other"
          }
          if (("Chrome" === e || "Safari" === e || "Opera" === e) && "20030107" !== n) return !0;
          var t, n = eval.toString().length; {
            if (37 === n && "Safari" !== e && "Firefox" !== e && "Other" !== e) return !0;
            if (39 === n && "Internet Explorer" !== e && "Other" !== e) return !0;
            if (33 === n && "Chrome" !== e && "AOSP" !== e && "Opera" !== e && "Other" !== e) return !0
          }
          try {
            throw "a"
          } catch (e) {
            try {
              e.toSource(), t = !0
            } catch (e) {
              t = !1
            }
          }
          return t && "Firefox" !== e && "Other" !== e
        }() || Op()
      },
      j61: function() {
        try {
          var e = Lp(),
            n = e.getExtension("WEBGL_debug_renderer_info"),
            t = e.getParameter(n.UNMASKED_VENDOR_WEBGL) + "~" + e.getParameter(n.UNMASKED_RENDERER_WEBGL);
          return Mp(e), t
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j62: Ss,
      j63: function() {
        var e = {};
        try {
          return navigator && N.connection ? (e.downlink = N.connection.downlink, e.effectiveType = N.connection.effectiveType, e.rtt = N.connection.rtt, e.saveData = N.connection.saveData, e) : Q.NOT_SUPPORT
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j64: function() {
        var e = navigator.userAgent.toLowerCase();
        e = 0 <= D(e).call(e, "windows phone") || 0 <= D(e).call(e, "windows") || 0 <= D(e).call(e, "win16") || 0 <= D(e).call(e, "win32") || 0 <= D(e).call(e, "win64") || 0 <= D(e).call(e, "win95") || 0 <= D(e).call(e, "win98") || 0 <= D(e).call(e, "winnt") || 0 <= D(e).call(e, "wow64") ? "Windows" : 0 <= D(e).call(e, "android") ? "Android" : 0 <= D(e).call(e, "linux") || 0 <= D(e).call(e, "cros") || 0 <= D(e).call(e, "x11") ? "Others" : 0 <= D(e).call(e, "iphone") || 0 <= D(e).call(e, "ipad") || 0 <= D(e).call(e, "ipod") || 0 <= D(e).call(e, "crios") || 0 <= D(e).call(e, "fxios") ? "iOS" : 0 <= D(e).call(e, "macintosh") || 0 <= D(e).call(e, "mac_powerpc)") ? "Mac" : "Others";
        return e
      },
      j69: _.getFromLocalStorage.bind(window, T.DVLastPutSpendTime),
      j73: function() {
        var e = xp(),
          n = Np(),
          t = Pp(),
          t = t == Q.NOT_SUPPORT ? 1 : t,
          o = Math.round(Math.max(e * t, n * t)),
          e = Math.round(Math.min(e * t, n * t));
        return o + "*" + e
      },
      j76: function() {
        try {
          var e = document.body.getClientRects()[0];
          return B(e)
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j78: function() {
        try {
          var e, n = [];
          for (e in navigator) n.push(e);
          return _.MD5(B(n))
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j79: function() {
        try {
          for (var e = [], n = navigator.mimeTypes, t = 0; t < n.length; t++) e.push({
            description: n[t].description,
            suffixes: n[t].suffixes,
            type: n[t].type
          });
          return e
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j80: function() {
        try {
          var n = [];
          return ["AbsoluteOrientationSensor", "Accelerometer", "AmbientLightSensor", "GravitySensor", "Gyroscope", "LinearAccelerationSensor", "Magnetometer", "RelativeOrientationSensor", "OrientationSensor"].forEach(function(e) {
            window[e] && "function" == typeof window[e] && n.push(e)
          }), _.MD5(B(n))
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j87: function() {
        try {
          var e = window.performance;
          if (null == e || null == e.now()) return Q.NOT_SUPPORT;
          for (var n, t, o = 1, i = 1, a = n = e.now(), r = 0; r < 5e4; r++) n = a, a = e.now(), n < a && (o < (t = a - n) ? t < i && (i = t) : t < o && (i = o, o = t));
          return [o, i]
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j201: function() {
        try {
          return navigator.webdriver
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      },
      j203: function() {
        try {
          return 120 < window.outerHeight - window.innerHeight || 30 < window.outerWidth - window.innerWidth ? !0 : !1
        } catch (e) {
          return Q.NOT_SUPPORT
        }
      }
    },
    N = navigator,
    Rp = window;

  function xp() {
    return window.screen.width
  }

  function Np() {
    return window.screen.height
  }

  function Pp() {
    return window.devicePixelRatio || Q.NOT_SUPPORT
  }

  function Up(e) {
    var n, t = window.screen;
    switch (e) {
      case "height":
        n = 0 == window.screen.availHeight ? 0 : window.screen.availHeight || Q.NOT_SUPPORT;
        break;
      case "width":
        n = 0 == window.screen.availWidth ? 0 : window.screen.availWidth || Q.NOT_SUPPORT;
        break;
      case "top":
        n = 0 == t.availTop ? 0 : t.availTop || Q.NOT_SUPPORT;
        break;
      case "left":
        n = 0 == t.availLeft ? 0 : t.availLeft || Q.NOT_SUPPORT
    }
    return n
  }

  function Op() {
    var e = navigator.userAgent ? navigator.userAgent.toLowerCase() : "",
      n = N.oscpu,
      t = navigator.platform ? navigator.platform.toLowerCase() : "",
      o = 0 <= D(e).call(e, "windows phone") ? "Windows Phone" : 0 <= D(e).call(e, "windows") || 0 <= D(e).call(e, "win16") || 0 <= D(e).call(e, "win32") || 0 <= D(e).call(e, "win64") || 0 <= D(e).call(e, "win95") || 0 <= D(e).call(e, "win98") || 0 <= D(e).call(e, "winnt") || 0 <= D(e).call(e, "wow64") ? "Windows" : 0 <= D(e).call(e, "android") ? "Android" : 0 <= D(e).call(e, "linux") || 0 <= D(e).call(e, "cros") || 0 <= D(e).call(e, "x11") ? "Linux" : 0 <= D(e).call(e, "iphone") || 0 <= D(e).call(e, "ipad") || 0 <= D(e).call(e, "ipod") || 0 <= D(e).call(e, "crios") || 0 <= D(e).call(e, "fxios") ? "iOS" : 0 <= D(e).call(e, "macintosh") || 0 <= D(e).call(e, "mac_powerpc)") ? "Mac" : "Other";
    if (("ontouchstart" in window || 0 < N.maxTouchPoints || 0 < N.msMaxTouchPoints) && "Windows" !== o && "Windows Phone" !== o && "Android" !== o && "iOS" !== o && "Other" !== o && -1 === D(e).call(e, "cros")) return !0;
    if ("string" == typeof n) {
      if (n = n.toLowerCase(), 0 <= D(n).call(n, "win") && "Windows" !== o && "Windows Phone" !== o) return !0;
      if (0 <= D(n).call(n, "linux") && "Linux" !== o && "Android" !== o) return !0;
      if (0 <= D(n).call(n, "mac") && "Mac" !== o && "iOS" !== o) return !0;
      if ((-1 === D(n).call(n, "win") && -1 === D(n).call(n, "linux") && -1 === D(n).call(n, "mac")) != ("Other" === o)) return !0
    }
    return 0 <= D(t).call(t, "win") && "Windows" !== o && "Windows Phone" !== o || ((0 <= D(t).call(t, "linux") || 0 <= D(t).call(t, "android") || 0 <= D(t).call(t, "pike")) && "Linux" !== o && "Android" !== o || ((0 <= D(t).call(t, "mac") || 0 <= D(t).call(t, "ipad") || 0 <= D(t).call(t, "ipod") || 0 <= D(t).call(t, "iphone")) && "Mac" !== o && "iOS" !== o || !(0 <= D(t).call(t, "arm") && "Windows Phone" === o) && (!(0 <= D(t).call(t, "pike") && 0 <= D(e).call(e, "opera mini")) && ((D(t).call(t, "win") < 0 && D(t).call(t, "linux") < 0 && D(t).call(t, "mac") < 0 && D(t).call(t, "iphone") < 0 && D(t).call(t, "ipad") < 0 && D(t).call(t, "ipod") < 0) != ("Other" === o) || void 0 === navigator.plugins && "Windows" !== o && "Windows Phone" !== o))))
  }

  function Lp() {
    var e = document.createElement("canvas"),
      n = null;
    try {
      n = e.getContext("webgl") || e.getContext("experimental-webgl")
    } catch (e) {}
    return n = n || null
  }

  function Mp(e) {
    e = e.getExtension("WEBGL_lose_context");
    null != e && e.loseContext()
  }

  function Fp() {
    return new w(function(n) {
      try {
        navigator && N.getBattery ? (N.getBattery().then(function(e) {
          return n({
            charging: e.charging,
            level: e.level,
            chargingTime: e.chargingTime,
            dischargingTime: e.dischargingTime
          })
        }), os(function() {
          n(Q.TIMEOUT)
        }, 100)) : n(Q.NOT_SUPPORT)
      } catch (e) {
        n(Q.NOT_SUPPORT)
      }
    })
  }

  function Gp() {
    return new w(function(n) {
      var e = window.RTCPeerConnection || Rp.mozRTCPeerConnection || Rp.webkitRTCPeerConnection;
      if (e) {
        os(function() {
          n(Q.TIMEOUT)
        }, 5e3);
        try {
          var t = new e;
          t.createDataChannel(""), t.onicecandidate = function(e) {
            e.candidate && e.candidate.candidate && n({
              candidate: e.candidate.candidate || Q.EMPTY,
              localDescription: t.localDescription || Q.EMPTY
            })
          }, t.createOffer().then(function(e) {
            t.setLocalDescription(e)
          })
        } catch (e) {
          n(Q.NOT_SUPPORT)
        }
      } else n(Q.NOT_SUPPORT)
    })
  }

  function Jp() {
    try {
      var e = document.createElement("canvas");
      return e.getContext && e.getContext("2d")
    } catch (e) {
      return
    }
  }
  var Hp = !1;

  function Yp() {
    return new w(function(n) {
      try {
        os(function() {
          n(Q.TIMEOUT)
        }, 5e3), ! function() {
          var i, a, e = new w(function(e, n) {
            i = e, a = n
          });
          if (navigator.userAgent.match(/OS 11.+Version\/11.+Safari/)) return a("EXCLUDED");
          var n = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          if (!n) return a(Q.NOT_SUPPORT);
          var t = new n(1, 44100, 44100),
            r = t.createOscillator(),
            c = (r.type = "triangle", r.frequency.setValueAtTime(1e4, t.currentTime), t.createDynamicsCompressor()),
            l = ([
              ["threshold", -50],
              ["knee", 40],
              ["ratio", 12],
              ["reduction", -20],
              ["attack", 0],
              ["release", .25]
            ].forEach(function(e) {
              void 0 !== c[e[0]] && "function" == typeof c[e[0]].setValueAtTime && c[e[0]].setValueAtTime(e[1], t.currentTime)
            }), r.connect(c), c.connect(t.destination), r.start(0), t.startRendering(), os(function() {
              return t.oncomplete = function() {}, t = null, a(Q.TIMEOUT)
            }, 1e3));
          return t.oncomplete = function(n) {
            var e, t, o;
            try {
              clearTimeout(l), e = Ng(t = Tl(o = n.renderedBuffer.getChannelData(0)).call(o, 4500, 5e3)).call(t, function(e, n) {
                return e + Math.abs(n)
              }, 0).toString(), r.disconnect(), c.disconnect()
            } catch (e) {
              n = "Unknown Error";
              return e && "string" == typeof e.message && "" != e.message ? n = e.message : e && "string" == typeof e && "" != e && (n = e), void a(n)
            }
            i(e)
          }, e
        }().then(function(e) {
          return n(_.MD5(e))
        }).catch(function(e) {
          return n(e)
        })
      } catch (e) {
        n(Q.NOT_SUPPORT)
      }
    })
  }
  var qp = null,
    Vp = 0;

  function Wp() {
    return new w(function(n) {
      try {
        if (os(function() {
          n(Q.TIMEOUT)
        }, 5e3), !navigator.storage) return n(Q.NOT_SUPPORT);
        navigator.storage.estimate().then(function(e) {
          return n(e.quota)
        }).catch(function() {
          return n(Q.EXCEPTION)
        })
      } catch (e) {
        return n(Q.EXCEPTION)
      }
    })
  }

  function Kp(e) {
    $p(e, iA, {
      value: {
        objectID: "O" + aA++,
        weakData: {}
      }
    })
  }
  var d = {
      exports: {}
    },
    Kn = !o(function() {
      return Object.isExtensible(Object.preventExtensions({}))
    }),
    Xp = f,
    ze = Fn,
    zp = a,
    Zp = de,
    $p = en.f,
    eA = vt,
    nA = ft,
    tA = Kn,
    oA = !1,
    iA = Ce("meta"),
    aA = 0,
    rA = Object.isExtensible || function() {
      return !0
    },
    cA = d.exports = {
      enable: function() {
        cA.enable = function() {}, oA = !0;
        var i = eA.f,
          a = [].splice,
          e = {};
        e[iA] = 1, i(e).length && (eA.f = function(e) {
          for (var n = i(e), t = 0, o = n.length; t < o; t++)
            if (n[t] === iA) {
              a.call(n, t, 1);
              break
            } return n
        }, Xp({
          target: "Object",
          stat: !0,
          forced: !0
        }, {
          getOwnPropertyNames: nA.f
        }))
      },
      fastKey: function(e, n) {
        if (!zp(e)) return "symbol" == typeof e ? e : ("string" == typeof e ? "S" : "P") + e;
        if (!Zp(e, iA)) {
          if (!rA(e)) return "F";
          if (!n) return "E";
          Kp(e)
        }
        return e[iA].objectID
      },
      getWeakData: function(e, n) {
        if (!Zp(e, iA)) {
          if (!rA(e)) return !0;
          if (!n) return !1;
          Kp(e)
        }
        return e[iA].weakData
      },
      onFreeze: function(e) {
        return tA && oA && rA(e) && !Zp(e, iA) && Kp(e), e
      }
    },
    lA = (ze[iA] = !0, f),
    sA = t,
    gA = d.exports,
    fA = o,
    hA = on,
    pA = ba,
    AA = Ha,
    dA = a,
    mA = Vt,
    uA = en.f,
    bA = co.forEach,
    kA = i,
    jA = ro.set,
    IA = ro.getterFor,
    EA = en.f,
    CA = wt,
    vA = Ga,
    yA = $e,
    BA = Ha,
    wA = ba,
    QA = mi,
    SA = Ja,
    TA = i,
    DA = d.exports.fastKey,
    _A = ro.set,
    RA = ro.getterFor;
  (function(t, e, n) {
    var a, r, o = -1 !== t.indexOf("Map"),
      c = -1 !== t.indexOf("Weak"),
      i = o ? "set" : "add",
      l = sA[t],
      s = l && l.prototype,
      g = {};
    kA && "function" == typeof l && (c || s.forEach && !fA(function() {
      (new l).entries().next()
    })) ? (a = e(function(e, n) {
      jA(AA(e, a, t), {
        type: t,
        collection: new l
      }), null != n && pA(n, e[i], {
        that: e,
        AS_ENTRIES: o
      })
    }), r = IA(t), bA(["add", "clear", "delete", "forEach", "get", "has", "set", "keys", "values", "entries"], function(o) {
      var i = "add" == o || "set" == o;
      o in s && (!c || "clear" != o) && hA(a.prototype, o, function(e, n) {
        var t = r(this).collection;
        if (!i && c && !dA(e)) return "get" == o && void 0;
        t = t[o](0 === e ? 0 : e, n);
        return i ? this : t
      })
    }), c || uA(a.prototype, "size", {
      configurable: !0,
      get: function() {
        return r(this).collection.size
      }
    })) : (a = n.getConstructor(e, t, o, i), gA.enable()), mA(a, t, !1, !0), g[t] = a, lA({
      global: !0,
      forced: !0
    }, g), c || n.setStrong(a, t, o)
  })("Map", function(e) {
    return function() {
      return e(this, arguments.length ? arguments[0] : void 0)
    }
  }, {
    getConstructor: function(e, t, o, i) {
      function a(e, n, t) {
        var o, i = l(e),
          a = r(e, n);
        return a ? a.value = t : (i.last = a = {
          index: o = DA(n, !0),
          key: n,
          value: t,
          previous: n = i.last,
          next: void 0,
          removed: !1
        }, i.first || (i.first = a), n && (n.next = a), TA ? i.size++ : e.size++, "F" !== o && (i.index[o] = a)), e
      }

      function r(e, n) {
        var t, e = l(e),
          o = DA(n);
        if ("F" !== o) return e.index[o];
        for (t = e.first; t; t = t.next)
          if (t.key == n) return t
      }
      var c = e(function(e, n) {
          BA(e, c, t), _A(e, {
            type: t,
            index: CA(null),
            first: void 0,
            last: void 0,
            size: 0
          }), TA || (e.size = 0), null != n && wA(n, e[i], {
            that: e,
            AS_ENTRIES: o
          })
        }),
        l = RA(t);
      return vA(c.prototype, {
        clear: function() {
          for (var e = l(this), n = e.index, t = e.first; t;) t.removed = !0, t.previous && (t.previous = t.previous.next = void 0), delete n[t.index], t = t.next;
          e.first = e.last = void 0, TA ? e.size = 0 : this.size = 0
        },
        delete: function(e) {
          var n, t, o = l(this),
            e = r(this, e);
          return e && (n = e.next, t = e.previous, delete o.index[e.index], e.removed = !0, t && (t.next = n), n && (n.previous = t), o.first == e && (o.first = n), o.last == e && (o.last = t), TA ? o.size-- : this.size--), !!e
        },
        forEach: function(e) {
          for (var n, t = l(this), o = yA(e, 1 < arguments.length ? arguments[1] : void 0, 3); n = n ? n.next : t.first;)
            for (o(n.value, n.key, this); n && n.removed;) n = n.previous
        },
        has: function(e) {
          return !!r(this, e)
        }
      }), vA(c.prototype, o ? {
        get: function(e) {
          e = r(this, e);
          return e && e.value
        },
        set: function(e, n) {
          return a(this, 0 === e ? 0 : e, n)
        }
      } : {
        add: function(e) {
          return a(this, e = 0 === e ? 0 : e, e)
        }
      }), TA && EA(c.prototype, "size", {
        get: function() {
          return l(this).size
        }
      }), c
    },
    setStrong: function(e, n, t) {
      var o = n + " Iterator",
        i = RA(n),
        a = RA(o);
      QA(e, n, function(e, n) {
        _A(this, {
          type: o,
          target: e,
          state: i(e),
          kind: n,
          last: void 0
        })
      }, function() {
        for (var e = a(this), n = e.kind, t = e.last; t && t.removed;) t = t.previous;
        return e.target && (e.last = t = t ? t.next : e.state.first) ? "keys" == n ? {
          value: t.key,
          done: !1
        } : "values" == n ? {
          value: t.value,
          done: !1
        } : {
          value: [t.key, t.value],
          done: !1
        } : {
          value: e.target = void 0,
          done: !0
        }
      }, t ? "entries" : "values", !t, !0), SA(n)
    }
  });
  var xA, NA, PA, UA = ie.Map,
    OA = ((ge = xA = xA || {})[ge.loading = 0] = "loading", ge[ge.running = 1] = "running", function() {
      function n(e) {
        var t = this;
        Kc(this, n), this.fetchMap = new UA, this.iframe = document.createElement("iframe"), this.iframe.id = "dv_iframe", this.iframe.src = _.transformCdnDomain(e) + S.URL_IFRAME, this.iframe.style.display = "none", "complete" == document.readyState || "interactive" == document.readyState ? document.body.appendChild(this.iframe) : _.on(document, "DOMContentLoaded", function() {
          document.body.appendChild(t.iframe)
        }), this.status = xA.loading, this.iframe.onload = function() {
          t.status = xA.running
        }, _.on(window, "message", function(e) {
          if ("string" == typeof e.data) {
            var n = null;
            try {
              n = JSON.parse(e.data)
            } catch (e) {}
            n && "string" == typeof n.key && Xl(e = n.key).call(e, "DV_IFRAME_MSG") && ((e = t.fetchMap.get(n.key)) && (t.fetchMap.delete(n.key), !e.needBeFresh || _.now() - n.time < 1e4 ? e.resolve(n.value || null) : e.resolve(null)))
          }
        })
      }
      return tl(n, [{
        key: "get",
        value: function(t) {
          var o, i = this,
            a = 1 < arguments.length && void 0 !== arguments[1] && arguments[1],
            e = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 0,
            n = new w(function(e) {
              o = e
            });
          return _.waituntil(function() {
            return i.status == xA.running
          }, 100, e || og).then(function() {
            for (var n; n = "DV_IFRAME_MSG_" + Math.round(1e6 * Math.random()), i.fetchMap.has(n););
            i.fetchMap.set(n, {
              needBeFresh: a,
              resolve: o
            }), os(function() {
              var e = i.fetchMap.get(n);
              e && (e.resolve(null), i.fetchMap.delete(n))
            }, 1e3);
            var e = {
              key: n,
              get: t
            };
            i.iframe.contentWindow.postMessage(B(e), "*")
          }, function() {
            o(null)
          }), n
        }
      }, {
        key: "set",
        value: function(e, n) {
          var t = this,
            o = 2 < arguments.length && void 0 !== arguments[2] && arguments[2];
          _.waituntil(function() {
            return t.status == xA.running
          }, 100, og).then(function() {
            t.iframe.contentWindow.postMessage(B({
              key: "DV_IFRAME_MSG",
              set: {
                key: e,
                value: n,
                keepFresh: !!o
              }
            }), "*")
          })
        }
      }]), n
    }()),
    LA = function() {
      function e() {
        Kc(this, e), this.dataPoster = new Ds, this.dataCollection = new Dp, this.wasm = new Rs;
        try {
          window.addEventListener("unload", this.onUnload.bind(this))
        } catch (e) {}
      }
      var n, t;
      return tl(e, [{
        key: "getInfoForZhengdao",
        value: (t = Wc(is.mark(function e(n) {
          var t, o, i;
          return is.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
              case 0:
                return this.iframe || (this.iframe = new OA(n)), e.next = 3, this.dataCollection.getRaphaelInfoForZhengdao();
              case 3:
                return t = e.sent, e.next = 6, this.iframe.get("ptt", !0, 3e3);
              case 6:
                return i = e.sent, o = (o = i ? parseInt(i, 10) : o) || _.getRndInteger(0, Math.pow(10, 8)), this.setPttToIframe(o), e.abrupt("return", {
                  info: t,
                  ptt: o
                });
              case 11:
              case "end":
                return e.stop()
            }
          }, e, this)
        })), function(e) {
          return t.apply(this, arguments)
        })
      }, {
        key: "getValueForField",
        value: (n = Wc(is.mark(function e(n) {
          return is.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
              case 0:
                return e.abrupt("return", this.dataCollection.getValueForField(n));
              case 1:
              case "end":
                return e.stop()
            }
          }, e, this)
        })), function(e) {
          return n.apply(this, arguments)
        })
      }, {
        key: "setPttToIframe",
        value: function(e) {
          this.iframe && this.iframe.set("ptt", e + "", !0)
        }
      }, {
        key: "setEnv",
        value: function(e) {
          return e && "string" == typeof e ? (ul(e).call(e, "/") && (e = Tl(e).call(e, 0, e.length - 1)), ul(e).call(e, ".") && (e = Tl(e).call(e, 0, e.length - 1)), Ll(e).call(e, ".:") && (e = e.replace(".:", ":")), Xl(e).call(e, "https://") || Xl(e).call(e, "http://") || (e = "https://" + e), this.dataPoster.setEnv(e), this.dataPoster.sendSimpleRequest(), Q.SUCCESS) : Q.PARA_ERR
        }
      }, {
        key: "setAccessKey",
        value: function(e) {
          return e && "string" == typeof e ? (this.dataPoster.setAck(e), this.dataCollection.addInfo("u1", e), Q.SUCCESS) : Q.PARA_ERR
        }
      }, {
        key: "getEnv",
        value: function() {
          return this.dataPoster.getEnv() ? this.dataPoster.getEnv() : Q.EMPTY
        }
      }, {
        key: "getAccessKey",
        value: function() {
          return this.dataPoster.getAck() || Q.EMPTY
        }
      }, {
        key: "getZdEnv",
        value: function() {
          return this.zdEnv || Q.EMPTY
        }
      }, {
        key: "setZdEnv",
        value: function(e) {
          return e && "string" == typeof e ? (ul(e).call(e, "/") && (e = Tl(e).call(e, 0, e.length - 1)), Xl(e).call(e, "http://") && (e = Tl(e).call(e, 7)), 0 == (e = Xl(e).call(e, "https://") ? Tl(e).call(e, 8) : e).length ? Q.PARA_ERR : (this.zdEnv = e, Q.SUCCESS)) : Q.PARA_ERR
        }
      }, {
        key: "postEvent",
        value: function(e, n, t, o, i) {
          if ("string" != typeof e || "string" != typeof n || "string" != typeof t || "string" != typeof o) return i(Q.PARA_ERR), Q.PARA_ERR;
          e = {
            u1: e,
            v3: n,
            event_name: t,
            e1: o
          };
          _.ajax(us.MANUAL_POST_DATA.method, this.getEnv() + us.MANUAL_POST_DATA.url, B(e)).then(function(n) {
            var t;
            try {
              t = JSON.parse(n)
            } catch (e) {
              t = n
            }
            i(t)
          })
        }
      }, {
        key: "initToken",
        value: function(e) {
          var n, t = this,
            o = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null,
            i = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
          if (this.getAccessKey() == Q.EMPTY || this.getEnv() == Q.EMPTY) return Q.NO_PERMISSON;
          try {
            n = new MA(e)
          } catch (e) {
            return e
          }
          S.initTokenStartTime = _.now(), os(function() {
            S.dvWaitingResponse = !1;
            var e = Q.TIMEOUT;
            S.initTokenTimeoutReason && (e += ": ".concat(S.initTokenTimeoutReason)), n.safeSlowCb("", e)
          }, S.INIT_TOKEN_TIMEOUT), this.handleFastCb(n.safeFastCb);
          e = (e = _.getFromLocalStorage(T.DVMA)) && !isNaN(parseInt(e)) ? parseInt(e) : null, a = _.now();
          var e = !e || e < a,
            a = Qs() !== Q.EMPTY,
            r = _.now() - this.dataPoster.getLastPostTime() < S.POST_DATA_FREEZING_PERIOD;
          S.dvWaitingResponse ? n.safeSlowCb("", Q.RUNNING) : !r && e || !a ? (this.dataCollection.setCustomFields(o, i), S.dvWaitingResponse = !0, this.dataCollection.collect().then(function() {
            return _.waituntil(function() {
              var e;
              return Ll(e = [NA.NOT_PASSED_IN, NA.RETURNED_CJ, NA.RETURNED_ERR, NA.RETURNED_JT]).call(e, t.fastCbStatus)
            })
          }).then(function() {
            return w.resolve(t.fastCbStatus == NA.RETURNED_CJ && t.dataCollection.addInfo("v8", S.tempDVCJ || Q.NOT_SUPPORT))
          }, function() {
            return w.resolve()
          }).then(function() {
            return t.dataPoster.reportData(t.dataCollection.raphaelInfo, t.wasm)
          }).then(function(e) {
            return n.safeSlowCb(e, "")
          }, function(e) {
            return n.safeSlowCb("", e)
          })) : n.safeSlowCb(Qs(), "")
        }
      }, {
        key: "handleFastCb",
        value: function(n) {
          var t = this;
          if (!n) return this.fastCbStatus = NA.NOT_PASSED_IN, void this.dataCollection.addInfo("v11", 10);
          var e = Qs();
          return e !== Q.EMPTY ? (this.fastCbStatus = NA.RETURNED_JT, this.dataCollection.addInfo("v11", 11), void n(e, "")) : S.tempDVCJ ? (this.fastCbStatus = NA.RETURNED_CJ, this.dataCollection.addInfo("v11", 12), void n(S.tempDVCJ)) : void this.wasm.waitUntilInitEnd().then(function() {
            var e = Ss();
            if (e === Q.EMPTY) return t.fastCbStatus = NA.RETURNED_ERR, t.dataCollection.addInfo("v11", 14), void n("", Q.EXCEPTION);
            try {
              S.tempDVCJ = t.wasm.generateCjByWasm(e), t.fastCbStatus = NA.RETURNED_CJ, t.dataCollection.addInfo("v11", 1), n(S.tempDVCJ, "")
            } catch (e) {
              t.fastCbStatus = NA.RETURNED_ERR, t.dataCollection.addInfo("v11", e), n("", Q.EXCEPTION)
            }
          }).catch(function() {
            t.fastCbStatus = NA.RETURNED_ERR, t.dataCollection.addInfo("v11", 13), n("", Q.NOT_SUPPORT)
          })
        }
      }, {
        key: "onUnload",
        value: function() {
          S.tempDVID && _.setLocalStorage(T.DVID, S.tempDVID), S.tempDVToken && _.setLocalStorage(T.DVToken, S.tempDVToken), S.tempDVUUID && _.setLocalStorage(T.DVUUID, S.tempDVUUID)
        }
      }], [{
        key: "getInstance",
        value: function() {
          return this.instance || (this.instance = new e), this.instance
        }
      }]), e
    }(),
    MA = function() {
      function n(e) {
        if (Kc(this, n), "function" == typeof e) this.slowCb = e;
        else {
          if (!("object" === ja(e) && "fastCb" in e && "realCb" in e && "function" == typeof e.fastCb && "function" == typeof e.realCb)) throw Q.PARA_ERR;
          this.fastCb = e.fastCb, this.slowCb = e.realCb
        }
        this.safeFastCb = this.safetyCallback(this.fastCb), this.safeSlowCb = this.safetyCallback(this.slowCb)
      }
      return tl(n, [{
        key: "safetyCallback",
        value: function(e) {
          var n = !1;
          return e ? function() {
            if (!n) {
              n = !0;
              try {
                e.apply(window, arguments)
              } catch (e) {
                console.error(e)
              }
            }
          } : null
        }
      }]), n
    }();

  function FA(e) {
    if (!e || "function" != typeof e) return Q.PARA_ERR;
    var n;
    window.dvEdgeRapahelJs2native && void 0 !== window.dvEdgeRapahelJs2native.getJSToken ? e(window.dvEdgeRapahelJs2native.getJSToken()) : window.webkit && window.webkit.messageHandlers && void 0 !== window.webkit.messageHandlers.dvEdgeRapahelJSAction ? (window._DV_DEDGE_NATIVE_CLLBACK[S.nativeCallbackIndex] = e, n = {
      cmd: "getJSToken",
      index: S.nativeCallbackIndex++
    }, window.webkit.messageHandlers.dvEdgeRapahelJSAction.postMessage(n)) : (console.error("No native SDK found"), e(Q.NOT_SUPPORT))
  }(v = NA = NA || {})[v.NOT_PASSED_IN = 0] = "NOT_PASSED_IN", v[v.NOT_CALLED = 1] = "NOT_CALLED", v[v.RETURNED_CJ = 2] = "RETURNED_CJ", v[v.RETURNED_JT = 3] = "RETURNED_JT", v[v.RETURNED_ERR = 4] = "RETURNED_ERR", window._DV_DEDGE_NATIVE_CLLBACK = {}, window.dvEdgeRapahel_GetiOSTokenFromWKWebView = function(e, n) {
    n = +n;
    var t = window._DV_DEDGE_NATIVE_CLLBACK[n];
    t && "function" == typeof t && (t(e), delete window._DV_DEDGE_NATIVE_CLLBACK[n])
  }, window.raphael && console.error("Repeated integration raphael sdk!"), window.raphael = function() {
    if (PA) return PA;
    var e = LA.getInstance();
    return PA = {
      initToken: e.initToken.bind(e),
      setAccessKey: e.setAccessKey.bind(e),
      getAccessKey: e.getAccessKey.bind(e),
      setEnv: e.setEnv.bind(e),
      getEnv: e.getEnv.bind(e),
      setZdEnv: e.setZdEnv.bind(e),
      getZdEnv: e.getZdEnv.bind(e),
      getDVToken: Qs,
      postEvent: e.postEvent.bind(e),
      getNativeToken: FA
    }
  }
}();


























