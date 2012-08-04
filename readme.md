#Falldown.js#

Falldown.js is a simple game that I'm developing as a hobby project. 
In the game, there are bunch of colored blocks falling 
and it's your job as the player  to catch *some* of them.

##Game Mechanics##

At any given time, you are a particular color, and you are only allowed to catch
blocks that are the same color as you. Occasionally, powerup objects will fall,
and catching them will change your color. Of course, the color requirement isn't
enforced yet, so for now you just have to pretend.

##Running##

You can run *Falldown.js* by dropping the contents into any old web server, and opening the [index.html][1] file. 
I've provided [server.js][2] to run with Node.js, which will statically serve all of the files on port 8888. 
I'm testing with Chrome, but it should also work in Firefox.

You can also find a working demo [here][3].

##Development Status##

The basic bits are mostly done. Blocks and powerups fall from the sky. 
Sounds play when you catch them. Powerups will cause your color to change
to whatever their color was. No scoring/health system yet.


  [1]: https://github.com/dylemma/Falldown.js/blob/master/index.html
  [2]: https://github.com/dylemma/Falldown.js/blob/master/server.js
  [3]: http://dylemma.github.com/Falldown.js/