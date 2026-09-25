import { ExportFormat, SavedTranscript, TranscriptSegment } from '../types';

export const formatDuration = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}]`;
};

export const formatSrtTime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  const milliseconds = ms % 1000;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

export const generateSrtContent = (segments: TranscriptSegment[]): string => {
  if (!segments || segments.length === 0) return '';
  return segments
    .filter((s) => s.text.trim().length > 0)
    .map((segment, index) => {
      const startTime = segment.timestamp;
      // Estimate segment end time: at least 2.5s or until next segment
      const nextSegment = segments[index + 1];
      const endTime = nextSegment ? Math.max(startTime + 1500, nextSegment.timestamp) : startTime + 3000;
      return `${index + 1}\n${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n${segment.text.trim()}\n`;
    })
    .join('\n');
};

export const generateTextFileContent = (data: {
  title: string;
  text: string;
  languageName: string;
  createdAt: number;
  durationSeconds: number;
  wordCount: number;
}): string => {
  const dateStr = new Date(data.createdAt).toLocaleString();
  const separator = '='.repeat(50);
  return `${separator}
TRANSCRIPTION: ${data.title}
Date: ${dateStr}
Language: ${data.languageName}
Duration: ${formatDuration(data.durationSeconds)}
Word Count: ${data.wordCount}
${separator}

${data.text}
`;
};

export const generateMarkdownContent = (data: {
  title: string;
  text: string;
  languageName: string;
  createdAt: number;
  durationSeconds: number;
  wordCount: number;
}): string => {
  const dateStr = new Date(data.createdAt).toLocaleString();
  return `# ${data.title}

> **Date:** ${dateStr}  
> **Language:** ${data.languageName}  
> **Duration:** ${formatDuration(data.durationSeconds)}  
> **Word Count:** ${data.wordCount} words  

---

${data.text}
`;
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const exportTranscript = (
  transcript: {
    title: string;
    text: string;
    segments?: TranscriptSegment[];
    languageName: string;
    createdAt?: number;
    durationSeconds?: number;
  },
  format: ExportFormat = 'txt'
): void => {
  const safeTitle = (transcript.title || 'transcript').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${safeTitle}_${timestamp}.${format}`;
  const now = transcript.createdAt || Date.now();
  const words = transcript.text.trim() ? transcript.text.trim().split(/\s+/).length : 0;
  const duration = transcript.durationSeconds || 0;

  switch (format) {
    case 'txt': {
      const content = generateTextFileContent({
        title: transcript.title,
        text: transcript.text,
        languageName: transcript.languageName,
        createdAt: now,
        durationSeconds: duration,
        wordCount: words,
      });
      downloadFile(content, filename, 'text/plain;charset=utf-8');
      break;
    }
    case 'md': {
      const content = generateMarkdownContent({
        title: transcript.title,
        text: transcript.text,
        languageName: transcript.languageName,
        createdAt: now,
        durationSeconds: duration,
        wordCount: words,
      });
      downloadFile(content, filename, 'text/markdown;charset=utf-8');
      break;
    }
    case 'srt': {
      const srt = generateSrtContent(transcript.segments || []);
      downloadFile(srt || transcript.text, filename, 'text/plain;charset=utf-8');
      break;
    }
    case 'json': {
      const jsonContent = JSON.stringify(
        {
          ...transcript,
          wordCount: words,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );
      downloadFile(jsonContent, filename, 'application/json');
      break;
    }
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
};
