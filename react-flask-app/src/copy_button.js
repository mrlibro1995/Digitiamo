// CopyButton.js

import React from 'react';
import './ShowResponse.css'; // Assuming you have a separate CSS file for styling

const CopyButton = ({ textToCopy }) => {
  const handleCopy = () => {
    // Create a temporary input element
    const input = document.createElement('textarea');
    input.value = textToCopy;

    // Append the input element to the document
    document.body.appendChild(input);

    // Select the text in the input element
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices

    // Copy the selected text to the clipboard
    document.execCommand('copy');

    // Remove the temporary input element
    document.body.removeChild(input);

    // You can provide feedback to the user (optional)
    alert('Text copied to clipboard: ' + textToCopy);
  };

  return (
    <button className="copy-button" onClick={handleCopy}>
      Click To Share!
    </button>
  );
};

export default CopyButton;