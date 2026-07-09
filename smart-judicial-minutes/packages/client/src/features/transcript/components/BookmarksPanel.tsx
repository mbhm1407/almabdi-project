import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, BookmarkRegular } from '@fluentui/react-icons';
import { formatDuration, type Bookmark } from '@smj/shared';
import { AR } from '../../../strings';

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: '320px',
  },
  addRow: { display: 'flex', gap: tokens.spacingHorizontalS },
  addInput: { flex: 1 },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    maxHeight: '320px',
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  jump: {
    flex: 1,
    justifyContent: 'flex-start',
    textAlign: 'start',
  },
  time: {
    color: tokens.colorBrandForeground1,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: tokens.fontWeightSemibold,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    paddingBlock: tokens.spacingVerticalL,
  },
});

interface BookmarksPanelProps {
  open: boolean;
  bookmarks: Bookmark[];
  canAdd: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onJump: (bookmark: Bookmark) => void;
}

/** Lists judicial bookmarks; lets the clerk add, remove, and jump to each. */
export function BookmarksPanel({
  open,
  bookmarks,
  canAdd,
  onClose,
  onAdd,
  onRemove,
  onJump,
}: BookmarksPanelProps) {
  const styles = useStyles();
  const [label, setLabel] = useState('');

  const submit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setLabel('');
  };

  return (
    <Dialog open={open} onOpenChange={(_e, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{AR.bookmarks}</DialogTitle>
          <DialogContent>
            <div className={styles.body}>
              {canAdd && (
                <div className={styles.addRow}>
                  <Input
                    className={styles.addInput}
                    value={label}
                    onChange={(_e, d) => setLabel(d.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder={AR.bookmarkLabelPlaceholder}
                    aria-label={AR.addBookmark}
                  />
                  <Button appearance="primary" icon={<AddRegular />} onClick={submit}>
                    {AR.addBookmark}
                  </Button>
                </div>
              )}

              {bookmarks.length === 0 ? (
                <Text className={styles.empty}>{AR.noBookmarks}</Text>
              ) : (
                <div className={styles.list}>
                  {bookmarks.map((b) => (
                    <div key={b.id} className={styles.item}>
                      <Button
                        className={styles.jump}
                        appearance="subtle"
                        icon={<BookmarkRegular />}
                        onClick={() => onJump(b)}
                      >
                        <span className={styles.time}>{formatDuration(b.offsetMs)}</span>
                        {'  '}
                        {b.label}
                      </Button>
                      <Button
                        appearance="subtle"
                        icon={<DeleteRegular />}
                        aria-label="حذف العلامة"
                        onClick={() => onRemove(b.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button appearance="secondary" onClick={onClose}>
                  {AR.close}
                </Button>
              </div>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
