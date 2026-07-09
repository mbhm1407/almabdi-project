import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import type { ExportFormat } from '@smj/shared';
import { apiClient } from '../../../services/apiClient';

interface ExportMenuProps {
  sessionId: string | null;
  disabled?: boolean;
  onError: (message: string) => void;
}

const FORMATS: Array<{ format: ExportFormat; label: string }> = [
  { format: 'pdf', label: 'تصدير PDF' },
  { format: 'docx', label: 'تصدير Word (DOCX)' },
  { format: 'txt', label: 'تصدير نص (TXT)' },
];

/** Download the current session transcript in the chosen format. */
export function ExportMenu({ sessionId, disabled, onError }: ExportMenuProps) {
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!sessionId) return;
    setBusy(true);
    try {
      const blob = await apiClient.exportTranscript(sessionId, format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `transcript.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'تعذر التصدير');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          icon={<ArrowDownloadRegular />}
          disabled={disabled || !sessionId || busy}
          appearance="secondary"
        >
          تصدير
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {FORMATS.map(({ format, label }) => (
            <MenuItem key={format} onClick={() => void handleExport(format)}>
              {label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
