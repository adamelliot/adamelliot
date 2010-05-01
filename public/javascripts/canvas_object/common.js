Object.inherit = function(target, base) {
  var instance = base instanceof Function ? new base : base;
  // Merge in existing objects of this
  if (instance.inheritMerge && target.__parentObjects &&
    target.__parentObjects.indexOf(klass.constructor) != -1)
    instance.inheritMerge(target);
  delete instance.inheritMerge;
  
  for (var prop in instance) target[prop] = instance[prop];

  // Create a record of parents so we don't inherit from the same type
  // more than once
  target.__parentObjects = target.__parentObjects || [];
  if (instance.__parentObjects)
    for (var i = 0; i < instance.__parentObjects.length; i++)
      if (target.__parentObjects.indexOf(instance.__parentObjects[i]) == -1)
        target.__parentObjects.push(instance.__parentObjects[i]);
  target.__parentObjects.push(instance.constructor);
};
