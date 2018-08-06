/**
 * Implement namespaces similar to debug
 * @version 1.0
 */
'use strict';

let namespaces = {};
// Split
namespaces.parse = function(names) {
  if (!names.hasOwnProperty('env')  || names.env === '') {
      return;
  }
  let tmp = names.env.split(',').map(i => i.trim());
  names.enabled = tmp.filter(i => !i.startsWith('-'));
  names.disabled = tmp.filter(i => i.startsWith('-')).map(i => i.substring(1));
};
namespaces.match = function(ns, namelist) {
  for (let i = 0; i < namelist.length; i++) {
    // use for to exit asap
    let entry = namelist[i];
    // Try absolute matching ~ maybe faster?
    if (entry === ns) {
      return true;
    }
    // Try wildcard matching
    let wildcardPos = entry.indexOf(':*');
    if (wildcardPos !== -1 && ns.startsWith(entry.substring(0, wildcardPos))) {
      return true;
    }
  }
  return false;
};

//
// Verifies Namespaces
//
 namespaces.isEnabled =function(ns,names) {
  if (names.env === '') return false; // Not set ignore everything
  if (names.env === '*') return true; // Use all
  // Try matching
  return namespaces.match(ns, names.enabled) && !namespaces.match(ns, names.disabled);
}
module.exports = namespaces;
