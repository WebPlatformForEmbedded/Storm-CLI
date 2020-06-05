export default config => {
  return {
    init(test) {},
    step(test, step) {},
    log(m) {},
    sleep(milliseconds) {},
    pass(test, step) {},
    fail(test, step, err) {},
    success(test) {},
    error(test, err) {},
    finished(test) {},
  }
}
