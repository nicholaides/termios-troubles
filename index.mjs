import { spawn } from "node-pty";
import { Termios, native } from "node-termios";

const pty =
  // translate input to uppercase
  //
  // `cat` is simpler but `tr` makes it easier to differentiate echo'd input
  // from the child process' output
  spawn("tr", ["[:lower:]", "[:upper:]"], {});

  // alternatively:
  // send stdin to a file to prove that the process does receive all the input
  // and that the output is what's dropped
  // spawn('/bin/sh', ['-c', "tee stdin-log.txt | tr [:lower:] [:upper:]"], {});

pty.write("started\n");

function writeWithTermios() {
  const fd = pty.fd;

  // get the current termios settings
  const termios = new Termios(fd);

  pty.write("one\n");

  // write termios settings unchanged
  termios.writeTo(fd, native.ACTION.TCSADRAIN | native.ACTION.TCSASOFT);
  // termios.writeTo(fd, native.ACTION.TCSADRAIN);
  // termios.writeTo(fd, native.ACTION.TCSANOW);
  // termios.writeTo(fd, native.ACTION.TCSAFLUSH);

  pty.write("two\n");
}

pty.onData((data) => {
  process.stdout.write(data);

  // wait for STARTED to be output to ensure that the child process' stdio is
  // set up and if the spawn process is going to change any termios settings,
  // that it has already done so
  if (data.includes("STARTED")) {
    writeWithTermios();

    setTimeout(() => process.exit(), 1000);
  }
});
