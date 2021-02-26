<img width="346" alt="tzfriends-1 0 0" src="https://user-images.githubusercontent.com/40796/109318521-e49ee200-781b-11eb-97c1-c53e1ba3635b.png">

# tzfriends

a command line program to see what time your friends around the world are experiencing

## How to use

### Install

`npm i -g tzfriends`

### Set your location
`tzfriends --location <location>`

### Show the time for all friends now, your time
`tzfriends`

### Show the time for all friends at a certain time/date at your time
`tzfriends 7pm`

### See what time your friend is experiencing
`tzfriends 7pm --name <name>`

### Add a friend
`tzfriends add <name> <location>`

### Update a friend's location
`tzfriends set <name> <location>`

### Remove a friend
`tzfriends remove <name>`

### Toggle 12/24 hour clock 
`tzfriends -a <true|false>`

## Thanks!

Thanks to substack for the super cool tzloc!
