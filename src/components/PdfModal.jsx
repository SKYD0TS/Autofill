// components/PdfModal.js
import React, { useState } from 'react';
import styles from './PdfModal.module.css'; // Import your CSS module
import { createPortal } from "react-dom"

const PdfModal = ({ pdfUrl, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleModalClose = () => {
    setIsModalOpen(false);
    onClose(); // Call the onClose function passed from the parent component
  };

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={handleModalClose}>
          &times;
        </button>
        <iframe
          title="PDF Viewer"
          src={pdfUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  ,document.body);
};

export default PdfModal;