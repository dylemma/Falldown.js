System
======

My idea for what a System should do is for it to behave like an updater.
My old approach of "Spawn, Update, Kill, Reap" seems to work pretty nicely, but it should be more reuseable.

There should be some helpful building blocks for creating these components. (?)

The `spawn` function should operate on an input `array`, with a reference to the `world` as context.
It optionally adds new items directly into the `array`.

    spawn = function(array, world)

The `update` function should operate on an input `array`, with a reference to the `world` as context.
It updates the state (i.e. position, rotation, etc) of each item in the `array`.

    update = function(array, world)

The `decideDeath` function should operate on an input `array`, with a reference to the `world` as context.
It should return an object of the form {itemIndex: reasonForDeath}, with a field for each item that should be dead.

    decideDeaths = function(array, world)

The `reap` function should operate on an input `array` of objects with the form `{obj: deadObject, reason: reasonForDeath}`,
with a reference to the world for context. It should perform optional side effects in response to objects dying (e.g. playing a sound, changing the score, adding visual effects, etc)

    reap = function(array, world)