/**
 * Camera & OCR Native Service Abstraction
 * Supports real HTML5 webcam video streams, file input, and high-fidelity container sample captures
 */

export interface CapturedPhoto {
  uri: string;
  thumbnailUri: string;
  timestamp: string;
  width: number;
  height: number;
  extractedOcr?: {
    containerNumber?: string;
    ownerCode?: string;
    serial?: string;
    checkDigit?: number;
    sizeType?: string;
    confidence: number;
  };
}

// Sample authentic maritime container inspection shots generated for this applet
export const SAMPLE_CONTAINER_PHOTOS = {
  front_doors: '/src/assets/images/container_front_doors_1793341301902.jpg',
  container_damage: '/src/assets/images/container_damage_dent_1793341301946.jpg',
  interior_cargo: '/src/assets/images/container_interior_cargo_1793341302281.jpg',
  terminal_hero: '/src/assets/images/container_terminal_hero_1793341300240.jpg',
  inspector_avatar: '/src/assets/images/inspector_surveyor_avatar_1793341302487.jpg',
};

export const cameraService = {
  /**
   * Simulates OCR extraction on a captured container photo
   */
  extractContainerOcr(category: string): CapturedPhoto['extractedOcr'] {
    if (category === 'front_doors' || category === 'container_number') {
      return {
        containerNumber: 'MSCU 784219-4',
        ownerCode: 'MSC',
        serial: '784219',
        checkDigit: 4,
        sizeType: '45G1 (40ft High Cube)',
        confidence: 0.98,
      };
    }
    if (category === 'left_side' || category === 'right_side') {
      return {
        containerNumber: 'MSKU 841029-4',
        ownerCode: 'MSK',
        serial: '841029',
        checkDigit: 4,
        sizeType: '42G1 (40ft Standard)',
        confidence: 0.94,
      };
    }
    return {
      confidence: 0.88,
    };
  },

  /**
   * Convert file to base64 data url
   */
  async readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Get best photo for category fallback
   */
  getDefaultPhotoForCategory(category: string): string {
    switch (category) {
      case 'front_doors':
      case 'container_number':
      case 'csc_plate':
        return SAMPLE_CONTAINER_PHOTOS.front_doors;
      case 'interior':
        return SAMPLE_CONTAINER_PHOTOS.interior_cargo;
      case 'additional_damage':
      case 'left_side':
      case 'right_side':
        return SAMPLE_CONTAINER_PHOTOS.container_damage;
      default:
        return SAMPLE_CONTAINER_PHOTOS.front_doors;
    }
  },
};
