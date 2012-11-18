#Falldown.js

Falldown.js is a simple game that I'm developing as a hobby project. 
In the game, there are bunch of colored blocks falling 
and it's your job as the player  to catch *some* of them.

##Game Mechanics

Not entirely sure yet. There are lots of falling blocks, and the general idea is to only
catch the right color blocks. The "right" color will change every once in a while depending
on luck and/or explicit actions by the player.

##Running

To run the game, you have to have [Node.js](http://nodejs.org/) installed. From there,
just run `npm install`, then `node server`. This will serve the files on port 9090.
For the time being, all of the interesting stuff is on the `/test` page.

##Development Status

I'm currently building lots of components. There's a system for controlling the blocks;
player controls; a particle system; SVG-based rendering. Nothing yet in terms of rules
or scores.


  [1]: https://github.com/dylemma/Falldown.js/blob/master/index.html
  [2]: https://github.com/dylemma/Falldown.js/blob/master/server.js