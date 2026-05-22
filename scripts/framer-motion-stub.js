const React = require('react');

const PresenceContext = React.createContext(null);

function usePresence() {
  return [true, () => {}];
}

function AnimatePresence({ children }) {
  return children;
}

module.exports = {
  PresenceContext,
  usePresence,
  AnimatePresence,
};
