const fetch = require('node-fetch');

let passed = true;

// Function to generate all subsets of a given set
function generateSubsets(set) {
  const subsets = [];
  const totalSubsets = 1 << set.length; // 2^set.length
  for (let i = 1; i < totalSubsets; i++) { // Start at 1 to exclude the empty set
    const subset = [];
    for (let j = 0; j < set.length; j++) {
      if (i & (1 << j)) {
        subset.push(set[j]);
      }
    }
    subsets.push(subset);
  }
  return subsets;
}

// Function to convert array to URL string
function convertToUrl(array) {
  const queryString = array.join('%2C');
  return `http://localhost:3000/waypoints/filter?types=${queryString}`;
}

// Function to fetch JSON data from URL
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to check if the JSON data contains all elements of the array in "megas.type_ids"
function checkData(array, jsonData) {
  // Iterate through each object in the top-level array
  for (const item of jsonData) {
    // Check if there is a "megas" field and it is an array
    if (item.megas && Array.isArray(item.megas)) {
      // Iterate through each "mega" object
      for (const megas of item.megas) {
        // Get "type_ids" and check if it contains all elements of the array
        const typeIds = megas.type_ids || [];
        if (array.every(value => typeIds.includes(value))) {
          return true; // Found a match
        }
      }
    }
  }
  passed = false;
  return false; // No match found
}

// Main function to generate and validate all configurations
async function main() {
  const set = [1, 2, 3, 4, 5];
  const subsets = generateSubsets(set);

  for (const array of subsets) {
    console.log('Generated array:', array);

    // Convert array to URL string
    const url = convertToUrl(array);
    console.log('Generated URL:', url);

    // Fetch JSON data from URL
    const data = await fetchData(url);
    //console.log('Fetched JSON data:', data);

    // Check if the data contains all elements of the array
    const isValid = checkData(array, data);
    console.log('Data contains all array elements:', isValid);
  }

  if (passed) {
    console.log("All tests passed");
  } else {
    console.log("Not all tests passed. Check console")
  }
}

// Run the main function
main();
