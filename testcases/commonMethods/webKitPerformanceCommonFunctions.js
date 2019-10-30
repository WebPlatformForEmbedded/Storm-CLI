let samples = []

/**
 * This function resets the Samples array
 */
export const initializeSamplesArray = function() {
  samples = []
}

/**
 * This function fetches the FPS value
 * @returns {Samples Array}
 */
export const fetchFPS = function() {
  this.$thunder.api.WebKitBrowser.fps()
    .then(result => {
      if (isNaN(result) === false) {
        samples.push(result)
        return true
      } else {
        this.$log('Returned FPS value from Framework is not a number')
        throw new Error('Returned FPS value from Framework is not a number')
      }
    })
    .catch(err => err)
  return samples
}

/**
 * This function calculates the average of FPS samples collected in fetchFPS function
 * @returns {results}
 */
export const calcAvgFPS = function() {
  let sum = 0
  let results = {}
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i]
  }
  results.average = sum / samples.length
  results.average = results.average.toFixed(2)
  this.$log('average = ', results.average)
  samples = []
  return results
}
/**
 * This function validate whether average of samples is greater than minFPS
 * @param results
 * @param minFPS
 * @returns {boolean}
 */
export const validateFPS = function(results, minFPS) {
  if (results.average > minFPS) return true
  else {
    this.$log(
      `Minimum FPS was not met. Expected minimum is ${minFPS}, average is: ${results.average}`
    )
    throw new Error(
      `Minimum FPS was not met. Expected minimum is ${minFPS}, average is: ${results.average}`
    )
  }
}
