import { useState } from 'react';
import {
  Button,
  Caption1,
  Card,
  Dropdown,
  Field,
  Input,
  Option,
  Subtitle1,
  Text,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, PlayRegular, GavelRegular } from '@fluentui/react-icons';
import { ASSIGNABLE_JUDICIAL_ROLES, judicialRoleLabel, type JudicialRole } from '@smj/shared';
import { v4 as uuid } from 'uuid';
import type { Participant, SessionSetup as SessionSetupData } from '../types';

const useStyles = makeStyles({
  scroll: { flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: '640px',
    margin: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
    padding: tokens.spacingHorizontalXXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  brand: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS },
  fields: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  participant: {
    display: 'grid',
    gridTemplateColumns: '1fr 200px auto',
    gap: tokens.spacingHorizontalS,
    alignItems: 'end',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: tokens.spacingHorizontalM,
    paddingBlockStart: tokens.spacingVerticalM,
  },
  hint: { color: tokens.colorNeutralForeground3 },
});

interface SessionSetupProps {
  defaultTitle: string;
  clerkName: string;
  busy: boolean;
  onStart: (setup: SessionSetupData) => void;
}

/**
 * Pre-hearing setup. The clerk confirms the session title, enters the case
 * number, and prepares the roster of participants with their judicial roles
 * before starting live transcription.
 */
export function SessionSetup({ defaultTitle, clerkName, busy, onStart }: SessionSetupProps) {
  const styles = useStyles();
  const [title, setTitle] = useState(defaultTitle);
  const [caseNumber, setCaseNumber] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { id: uuid(), name: clerkName, role: 'clerk' },
    { id: uuid(), name: '', role: 'judge' },
  ]);

  const updateParticipant = (id: string, patch: Partial<Participant>) =>
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const addParticipant = () =>
    setParticipants((prev) => [...prev, { id: uuid(), name: '', role: 'observer' }]);

  const removeParticipant = (id: string) =>
    setParticipants((prev) => prev.filter((p) => p.id !== id));

  const handleStart = () => {
    onStart({
      meetingTitle: title.trim() || defaultTitle,
      caseNumber: caseNumber.trim(),
      participants: participants.filter((p) => p.name.trim().length > 0),
    });
  };

  return (
    <div className={styles.scroll}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <GavelRegular fontSize={28} />
          <Title3>إعداد جلسة النسخ</Title3>
        </div>
        <Text className={styles.hint}>
          جهّز بيانات الجلسة والمشاركين قبل بدء النسخ المباشر للكلام العربي.
        </Text>

        <div className={styles.fields}>
          <Field label="عنوان الجلسة" required>
            <Input value={title} onChange={(_e, d) => setTitle(d.value)} />
          </Field>
          <Field label="رقم القضية" hint="اختياري — يظهر في النص المُصدَّر">
            <Input
              value={caseNumber}
              onChange={(_e, d) => setCaseNumber(d.value)}
              placeholder="مثال: ٤٣٥/٢/ق"
            />
          </Field>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <Subtitle1>المشاركون والأدوار</Subtitle1>
            <Button icon={<AddRegular />} appearance="secondary" onClick={addParticipant}>
              إضافة مشارك
            </Button>
          </div>
          <Caption1 className={styles.hint}>
            يمكنك ربط كل متحدث بالدور القضائي أثناء الجلسة أيضًا.
          </Caption1>

          {participants.map((p) => (
            <div key={p.id} className={styles.participant}>
              <Field label="الاسم">
                <Input
                  value={p.name}
                  onChange={(_e, d) => updateParticipant(p.id, { name: d.value })}
                  placeholder="اسم المشارك"
                />
              </Field>
              <Field label="الدور">
                <Dropdown
                  value={judicialRoleLabel(p.role)}
                  selectedOptions={[p.role]}
                  onOptionSelect={(_e, data) =>
                    updateParticipant(p.id, { role: data.optionValue as JudicialRole })
                  }
                >
                  {ASSIGNABLE_JUDICIAL_ROLES.map((role) => (
                    <Option key={role} value={role} text={judicialRoleLabel(role)}>
                      {judicialRoleLabel(role)}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <Button
                icon={<DeleteRegular />}
                appearance="subtle"
                aria-label="حذف المشارك"
                onClick={() => removeParticipant(p.id)}
              />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button
            appearance="primary"
            size="large"
            icon={<PlayRegular />}
            disabled={busy}
            onClick={handleStart}
          >
            بدء النسخ المباشر
          </Button>
        </div>
      </Card>
    </div>
  );
}
