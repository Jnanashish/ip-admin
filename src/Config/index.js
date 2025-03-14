/**
 * Configuration module index
 * Central export point for all configuration values
 */

// Re-export all configuration modules
export * from './forms';
export * from './categories';
export * from './ui';
export * from './api';
export * from './validations';
export * from './firebase_config';
export * from './editorConfig';
export * from './social';

// Export default with all configurations grouped
import * as forms from './forms';
import * as categories from './categories';
import * as ui from './ui';
import * as api from './api';
import * as validations from './validations';
import * as firebaseConfig from './firebase_config';
import * as editorConfig from './editorConfig';
import * as social from './social';

export default {
    forms,
    categories,
    ui,
    api,
    validations,
    firebaseConfig,
    editorConfig,
    social,
}; 