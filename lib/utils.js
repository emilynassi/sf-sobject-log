module.exports = {
    //function for names to be parsed to initials
    turnNameToInitials(name) {
      var initials = name.match(/\b\w/g) || [];
      initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
      return initials;
    }
}