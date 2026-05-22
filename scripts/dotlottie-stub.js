const React = require('react');

const DotLottieReact = React.forwardRef((props, ref) => {
  return React.createElement('div', { style: props.style });
});

module.exports = {
  DotLottieReact,
};
