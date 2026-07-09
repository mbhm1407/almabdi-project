import { useState } from 'react';
import {
  Button,
  Caption1,
  Dropdown,
  Field,
  Input,
  Option,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { PersonEditRegular } from '@fluentui/react-icons';
import { ASSIGNABLE_JUDICIAL_ROLES, judicialRoleLabel, type JudicialRole } from '@smj/shared';
import type { Participant } from '../types';

const useStyles = makeStyles({
  surface: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: '260px',
  },
  roster: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
});

interface SpeakerAssignPopoverProps {
  currentLabel: string;
  currentRole: JudicialRole;
  participants: Participant[];
  onAssign: (label: string, role: JudicialRole) => void;
}

/** Popover to map a diarized speaker to a real name and judicial role. */
export function SpeakerAssignPopover({
  currentLabel,
  currentRole,
  participants,
  onAssign,
}: SpeakerAssignPopoverProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentLabel);
  const [role, setRole] = useState<JudicialRole>(currentRole);

  const commit = (label: string, r: JudicialRole) => {
    onAssign(label.trim() || label, r);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(_e, data) => setOpen(data.open)} withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          size="small"
          appearance="transparent"
          icon={<PersonEditRegular />}
          aria-label="تعيين المتحدث والدور"
          onClick={() => {
            setName(currentLabel);
            setRole(currentRole);
          }}
        />
      </PopoverTrigger>
      <PopoverSurface className={styles.surface}>
        {participants.length > 0 && (
          <>
            <Caption1>اختر من المشاركين</Caption1>
            <div className={styles.roster}>
              {participants.map((p) => (
                <Button key={p.id} size="small" onClick={() => commit(p.name, p.role)}>
                  {p.name} · {judicialRoleLabel(p.role)}
                </Button>
              ))}
            </div>
          </>
        )}
        <Field label="اسم المتحدث">
          <Input value={name} onChange={(_e, d) => setName(d.value)} autoFocus />
        </Field>
        <Field label="الدور القضائي">
          <Dropdown
            value={judicialRoleLabel(role)}
            selectedOptions={[role]}
            onOptionSelect={(_e, data) => setRole(data.optionValue as JudicialRole)}
          >
            {ASSIGNABLE_JUDICIAL_ROLES.map((r) => (
              <Option key={r} value={r} text={judicialRoleLabel(r)}>
                {judicialRoleLabel(r)}
              </Option>
            ))}
          </Dropdown>
        </Field>
        <div className={styles.actions}>
          <Button appearance="secondary" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button appearance="primary" onClick={() => commit(name, role)}>
            حفظ
          </Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
}
