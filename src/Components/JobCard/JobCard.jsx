import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Stack, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styles from './jobcard.module.scss';

/**
 * JobCard - A standardized component for displaying job information
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.job - Job data
 * @param {Function} props.onEdit - Function called when edit button is clicked
 * @param {Function} props.onDelete - Function called when delete button is clicked
 * @param {Function} props.onCopyLink - Function called when copy link button is clicked
 * @param {boolean} props.isSelected - Whether the card is selected
 * @returns {React.ReactElement} JobCard component
 */
const JobCard = ({
  job,
  onEdit,
  onDelete,
  onCopyLink,
  isSelected = false
}) => {
  if (!job) return null;

  return (
    <div className={`${styles.jobCard} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.jobCardHeader}>
        <div className={styles.companyLogo}>
          {job.imagePath ? (
            <img src={job.imagePath} alt={job.companyName} />
          ) : (
            <div className={styles.placeholderLogo}>
              {job.companyName?.charAt(0) || 'C'}
            </div>
          )}
        </div>
        
        <div className={styles.jobCardTitle}>
          <Typography variant="h6" component="h3">
            {job.title || 'Job Title'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {job.companyName || 'Company Name'}
          </Typography>
        </div>
        
        <div className={styles.jobCardActions}>
          <IconButton 
            size="small" 
            onClick={() => onEdit(job)} 
            aria-label="Edit job"
            className={styles.editButton}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={() => onDelete(job)} 
            aria-label="Delete job"
            className={styles.deleteButton}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={() => onCopyLink(job)} 
            aria-label="Copy job link"
            className={styles.copyButton}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      
      <div className={styles.jobCardContent}>
        <div className={styles.jobCardField}>
          <Typography variant="body2" className={styles.fieldLabel}>
            Role:
          </Typography>
          <Typography variant="body2" className={styles.fieldValue}>
            {job.role || 'N/A'}
          </Typography>
        </div>
        
        <div className={styles.jobCardField}>
          <Typography variant="body2" className={styles.fieldLabel}>
            Experience:
          </Typography>
          <Typography variant="body2" className={styles.fieldValue}>
            {job.experience || 'N/A'}
          </Typography>
        </div>
        
        <div className={styles.jobCardField}>
          <Typography variant="body2" className={styles.fieldLabel}>
            Location:
          </Typography>
          <Typography variant="body2" className={styles.fieldValue}>
            {job.location || 'N/A'}
          </Typography>
        </div>
        
        <div className={styles.jobCardField}>
          <Typography variant="body2" className={styles.fieldLabel}>
            Job Type:
          </Typography>
          <Typography variant="body2" className={styles.fieldValue}>
            {job.jobtype || 'N/A'}
          </Typography>
        </div>
        
        <div className={styles.jobCardField}>
          <Typography variant="body2" className={styles.fieldLabel}>
            Last Date:
          </Typography>
          <Typography variant="body2" className={styles.fieldValue}>
            {job.lastdate || 'N/A'}
          </Typography>
        </div>
      </div>
      
      <div className={styles.jobCardFooter}>
        <div className={styles.jobTags}>
          <Typography variant="body2" className={styles.tagsLabel}>
            Tags:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {job.tags && job.tags.length > 0 ? (
              job.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  className={styles.tagChip}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No tags
              </Typography>
            )}
          </Stack>
        </div>
        
        <div className={styles.jobStatus}>
          <Chip 
            label={job.isActive ? 'Active' : 'Inactive'} 
            color={job.isActive ? 'success' : 'error'} 
            size="small"
            className={styles.statusChip}
          />
        </div>
      </div>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    companyName: PropTypes.string,
    role: PropTypes.string,
    experience: PropTypes.string,
    location: PropTypes.string,
    jobtype: PropTypes.string,
    lastdate: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    isActive: PropTypes.bool,
    imagePath: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCopyLink: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
};

export default JobCard;