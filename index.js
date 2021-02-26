#!/usr/bin/env node
const hypertrie = require('hypertrie')
const minimist = require('minimist')
const os = require('os')
const path = require('path')
const strftime = require('strftime')
const Table = require('cli-table3')
const tzloc = require('tzloc')

var help = `
Usage: tzfriends <when> [--name]
Examples:
  # Show the time for all friends now, your time
  tzfriends
  # Show the time for all friends at a certain time/date at your time
  tzfriends 7pm
  # Set your location
  tzfriends --location <location>
  # See what time your friend is experiencing
  tzfriends 7pm --name <name>
  # Add a friend
  tzfriends add <name> <location>
  # Update a friend's location
  tzfriends set <name> <location>
  # Remove a friend
  tzfriends remove <name>
  # Toggle 12/24 hour clock 
  tzfriends -a <true|false>
`

const HOME_DIR = os.homedir()
const DB_DIR = path.join(HOME_DIR, '.tzfriends')

var args = minimist(process.argv.slice(2), { alias: { 'h': 'help', 'n': 'name', 'l': 'location' } })

if (args._.includes('add') || args._.includes('set')) {
  args.add = true
}

if (args._.includes('remove')) {
  args.remove = true
}

if (args._.includes('ls')) {
  args.ls = true
}

const db = new hypertrie(DB_DIR, {valueEncoding: 'json'})

db.get('me', (error, data) => {
  let me = (data && data.value) || {}

  if (args.a !== undefined) {
    me.am = !(args.a === 'false')
    db.put('me', me)
  }

  if (args.location) {
    me.location = args.location
    db.put('me', me)
  }

  if (!me.location) {
    process.stdout.write('Please set your location \n')
    process.stdout.write(help + '\n')
    process.exit(0)
  }

  db.get('friends', (error, data) => {
    let friends = (data && data.value) || {}

    var argless = !Object.keys(friends).length && !args.location && args._.length === 0
    if (argless || args.help) {
      process.stdout.write(help + '\n')
      process.exit(0)
    }

    if (args.add) {
      const name = args._[1]
      const location = args.location || args._[2]
      if (name && location) {
        friends[name] = { location }
        db.put('friends', friends)
      }
    } else if (args.remove || args.delete) {
      const name = args._[1]
      if (name) {
        delete(friends[name])
        db.put('friends', friends)
      }
    } else if (args.ls) {
      process.stdout.write(JSON.stringify(friends))
    } else {
      let time = args._[0] || 'now'
      var filteredFriends = friends
      if (args.name) {
        filteredFriends = {[args.name]: friends[args.name]}
      }

      process.stdout.write(`My location: ${me.location} \n\n`)

      let table = new Table({
        head: ['Friend', 'Time'],
      })

      Object.entries(filteredFriends).forEach(([name, data], index) => {
        if (data) {
          tzloc(time, me.location, data.location, (err, rows) => {
            if (err) { 
              console.error(err)
            } else {
              if (rows.length) {
                let timeFormat = '%T %F'
                if (me.am) {
                  timeFormat = '%I:%M%P %F'
                }
                table.push([name, strftime(timeFormat, rows[0].date)])
              } else {
                table.push([name, 'Location not found'])
              }
            }
          })
        } else {
          table.push([name, 'Friend not found'])
        }
      })
      setTimeout(() => { // lol
        process.stdout.write(table.toString() + '\n')
      }, 100)
    }
  })
})
