import { spawn } from 'node-pty'
import { Termios, native } from 'node-termios'

// translate input to uppercase
//
// would use `cat` instead, but `tr` makes it easier to differentiate echo'd
// input from the child process' output
const pty = spawn('tr', ['[:lower:]', '[:upper:]'], {})

// // send stdin to a file to prove that the process does receive all the input
// const pty = spawn('tee', ['test-output.txt'], {})

const fd = pty.fd

pty.write('one\n')

function writeWithTermios() {
  const termios = new Termios(fd) // get the current termios settings

  pty.write('two\n')

  // setImmediate and process.nextTick-- still happens
  // setTimeout-- fixes it (usually but not always)
  termios.writeTo(fd, native.ACTION.TCSADRAIN) // write the same settings

  pty.write('three\n')
}


let chunks = 0
pty.onData(data => {
  // stringify to clarify what chunks are received
  console.log(JSON.stringify(data))

  // wait for "one\r\n" to be echoed and "ONE\r\n" to be output to ensure that
  // the child process' stdio is set up before running the test
  if (++chunks === 2) {
     writeWithTermios()
  }
})
