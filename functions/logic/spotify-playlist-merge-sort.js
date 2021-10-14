function mergeSongs(left, right) {
  let arr = [];
  // Break out of loop if any one of the array gets empty
  while (left.length && right.length) {
    // Pick the smaller among the smallest element of left and right sub arrays
    if (left[0]["overall_rating"] > right[0]["overall_rating"]) {
      arr.push(left.shift());
    } else {
      arr.push(right.shift());
    }
  }

  // Concatenating the leftover elements
  // (in case we didn't go through the entire left or right array)
  return [...arr, ...left, ...right];
}

exports.mergeSortPlaylist = function mergeSortPlaylist(songs, spotifyApi) {
  const half = songs.length / 2;

  // Base case or terminating case
  if (songs.length < 2) {
    return songs;
  }

  const left = songs.splice(0, half);
  return mergeSongs(mergeSortPlaylist(left), mergeSortPlaylist(songs), spotifyApi);
};
