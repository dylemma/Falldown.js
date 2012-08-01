#Falldown.js#

Falldown.js is a simple game that I'm developing as a hobby project. In the game, there are bunch of colored blocks falling and it's your job as the player  to catch *some* of them.

I'm still working out the game mechanics - deciding between two modes:

 * **Color Matching** - You can only catch blocks that are the same color as you. You can change colors by catching "powerup" blocks. Hitting a wrong color block will cause *massive damage* (lose a life, or lose a bunch of points).
 
 * **Color Streak** - There is no requirement for what color block you can catch, but catching a bunch of the same color blocks in a row will result in a score multiplier. Uncatchable obstacles cause *massive damage*.

##Running##

You can run *Falldown.js* by dropping the contents into any old web server, and opening the [index.html][1] file. I've provided [server.js][2] to run with Node.js, which will statically serve all of the files on port 8888. I'm testing with Chrome, but it should also work in Firefox.

You can also find a working demo [here][3].

##Development Status##

I've got most of the basics down. Blocks fall from the sky and you can catch them. It'll play a sound when you catch a block. No scoring/health system yet. No powerups yet.


  [1]: https://github.com/dylemma/Falldown.js/blob/master/index.html
  [2]: https://github.com/dylemma/Falldown.js/blob/master/server.js
  [3]: http://dylemma.github.com/Falldown.js/