var assert = require('assert'),
    util = require('../../lib/util');

describe('util', function() {
  describe('deepMerge', function() {
    it('merges two objects recursively and non-destructively', function() {
      var object1 = {a: 0, b: 2, c: {d: 3}, e: {f: 4, g: 5}},
          object2 = {b: 3, c: 4, e: {f: 5, h: 6}},
          result = util.deepMerge(object1, object2);
      assert.deepEqual(result, {a: 0, b: 3, c: 4, e: {f: 5, g: 5, h: 6}})
      result.e.f = 100;
      assert.deepEqual({a: 0, b: 2, c: {d: 3}, e: {f: 4, g: 5}}, object1); // unchanged      

      assert.deepEqual(util.deepMerge({}, {a: 0}), {a: 0});
      assert.deepEqual(util.deepMerge({a: 1}, {}), {a: 1});
      assert.deepEqual(util.deepMerge({a: 1}, {b: 1}), {a: 1, b: 1});
      assert.deepEqual(util.deepMerge({a: 1}, {a: 2, b: 1}), {a: 2, b: 1});
      assert.deepEqual(util.deepMerge({a: "1"}, {a: "2", b: "1"}), {a: "2", b: "1"});
      assert.deepEqual(util.deepMerge({a: "1"}, {a: {b: "1"}}), {a: {b: "1"}});

      object1 = {a: 1};
      object2 = {b: {c: 2}};
      result = util.deepMerge(object1, object2);
      assert.deepEqual(result, {a: 1, b: {c: 2}});
      result.b.c = 3;
      assert.deepEqual(object2, {b: {c: 2}}, "merged object should be unchanged");
    });

    it('allows values to be overridden with null but not with undefined', function() {
      assert.deepEqual(util.deepMerge({foo: 1}, {foo: 2}), {foo: 2});
      assert.deepEqual(util.deepMerge({foo: 1}, {foo: null}), {foo: null});
      assert.deepEqual(util.deepMerge({foo: 1}, {foo: undefined}), {foo: 1});
    });
  });

  describe('nestedValue.get', function() {
    it('works', function() {
      assert.equal(util.nestedValue.get({foo: {bar: 1}}, 'foo.bar'), 1);
      assert.equal(util.nestedValue.get({foo: {bar: "1"}}, 'foo.bar'), "1");
      assert.deepEqual(util.nestedValue.get({foo: {bar: {baz: 2}}}, 'foo.bar'), {baz: 2});
    });

    it('returns undefined or default value if key doesnt exist', function() {
      assert.strictEqual(util.nestedValue.get({foo: 1}, 'foo.bar'), undefined);
      assert.strictEqual(util.nestedValue.get({foo: 1}, 'foo.bar', 'default value'), 'default value');
      assert.strictEqual(util.nestedValue.get({}, 'foo.bar'), undefined);
      assert.strictEqual(util.nestedValue.get({}, 'foo.bar', 5), 5);
    });
  });

  describe('nestedValue.set', function() {
    it('works', function() {
      // Already has value
      var hash = {foo: 1};
      util.nestedValue.set(hash, 'foo', 2)
      assert.deepEqual(hash, {foo: 2});

      // Missing
      hash = {};
      util.nestedValue.set(hash, 'foo', 1);
      assert.deepEqual(hash, {foo: 1});

      // Null
      hash = {foo: null};
      util.nestedValue.set(hash, 'foo', 1);
      assert.deepEqual(hash, {foo: 1});      

      // Nested hash
      hash = {foo: {bar: {baz: 2}}};
      util.nestedValue.set(hash, 'foo.bar', 1);
      assert.deepEqual(hash, {foo: {bar: 1}});      

      // Nested missing
      hash = {foo: {bar: {baz: 2}}};
      util.nestedValue.set(hash, 'bla.bla', 1);
      assert.deepEqual(hash, {foo: {bar: {baz: 2}}, bla: {bla: 1}});      
    });
  });

  describe('equalValues', function() {
    it('can handle null/undefined', function() {
      assert.equal(util.equalValues(null, null), true);
      assert.equal(util.equalValues(undefined, undefined), true);
      assert.equal(util.equalValues(null, undefined), true);
      assert.equal(util.equalValues(undefined, null), true);

      assert.equal(util.equalValues(null, ''), false);
      assert.equal(util.equalValues(undefined, ''), false);
      assert.equal(util.equalValues(null, {}), false);
      assert.equal(util.equalValues(1, null), false);
    });

    it('can handle primitive values', function() {
      assert.equal(util.equalValues(1, 1), true);
      assert.equal(util.equalValues(1, 1.0), true);
      assert.equal(util.equalValues("1", 1), true);
      assert.equal(util.equalValues(true, true), true);
      assert.equal(util.equalValues(true, false), false);
      assert.equal(util.equalValues('foobar', 'foobar'), true);
    });

    it('can handle objects', function() {
      assert.equal(util.equalValues({}, {}), true);
      assert.equal(util.equalValues({a: 1, b: 2}, {b: 2, a: 1}), true);
      assert.equal(util.equalValues({a: 1, b: 2}, {b: 2}), false);
      assert.equal(util.equalValues({a: 2, b: 1}, {b: 2, a: 1}), false);
      assert.equal(util.equalValues([2, 1], [2, 1]), true);
      assert.equal(util.equalValues([2, 1], [1, 2]), false);
    });
  });

  describe('digest', function() {
    it('generates a random digest by default', function() {
      assert.notEqual(util.digest(), util.digest());
      assert.notEqual(util.digest(), util.digest());
    });

    it('can generate a deterministic digest with the seed option', function() {
      var seed = 'foobar';
      assert.equal(util.digest({seed: seed}), util.digest({seed: seed}));
      assert.equal(util.digest({seed: seed}), util.digest({seed: seed}));
    });    
  });

  describe('isArrayIndex', function() {
    it('returns true for positive integers and integer strings', function() {
      assert(!util.isArrayIndex(undefined));
      assert(!util.isArrayIndex(null));
      assert(!util.isArrayIndex(3.6));  
      assert(!util.isArrayIndex(['1']));  
      assert(!util.isArrayIndex({5: 3}));  
      assert(!util.isArrayIndex(-1));  
      assert(!util.isArrayIndex("-1"));  
      assert(!util.isArrayIndex("1.5"));  
      assert(!util.isArrayIndex("0.1"));  
      assert(!util.isArrayIndex(" 0"));  
      assert(!util.isArrayIndex("0 "));  
      assert(!util.isArrayIndex("1 "));  
      assert(!util.isArrayIndex(" 1"));  
      assert(!util.isArrayIndex("foobar"));  
      assert(!util.isArrayIndex(true));  

      assert(util.isArrayIndex(5));  
      assert(util.isArrayIndex(0));  
      assert(util.isArrayIndex(123));  
      assert(util.isArrayIndex("0"));  
      assert(util.isArrayIndex("1"));  
      assert(util.isArrayIndex("1000"));  
    });
  });

  describe('isUrl', function() {
    it('returns true for http/https URLs and false for paths', function() {
      assert(!util.isUrl('foobar'));
      assert(!util.isUrl('/foobar'));
      assert(!util.isUrl('/foo/bar'));
      assert(!util.isUrl('/foo/bar?bla=1'));
      assert(!util.isUrl('http:/foobar'));
      assert(!util.isUrl('https:/foobar'));
      assert(!util.isUrl('fhttps://foobar'));

      assert(util.isUrl('http://foobar'));
      assert(util.isUrl('https://foobar'));
      assert(util.isUrl('http://foobar'));
      assert(util.isUrl('http://foo/bar'));
      assert(util.isUrl('https://foo/bar?bla=1'));
    });
  });
});