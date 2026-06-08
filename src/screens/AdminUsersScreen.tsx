import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { RiskCard } from '../components/RiskCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { clearDemoData, loadDemoData } from '../services/demoDataService';
import { getUsers, saveUsers } from '../services/storage';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Session, User, UserRole } from '../types';

type AdminUsersScreenProps = {
  session: Session;
  onLogout: () => void;
};

type NewUserRole = Extract<UserRole, 'manager' | 'resident'>;

const roleLabels: Record<UserRole, string> = {
  system_admin: 'Administrador del sistema',
  manager: 'Encargado operativo',
  resident: 'Residente',
};

const roleChipTones: Record<UserRole, 'warning' | 'success' | 'info'> = {
  system_admin: 'warning',
  manager: 'success',
  resident: 'info',
};

function formatDate(value: string) {
  return value.split('T')[0] || 'Sin fecha';
}

function getRoleSeverity(role: UserRole): 'low' | 'medium' | 'high' {
  if (role === 'system_admin') {
    return 'high';
  }

  if (role === 'manager') {
    return 'medium';
  }

  return 'low';
}

export function AdminUsersScreen({ session, onLogout }: AdminUsersScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<NewUserRole>('manager');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      const storedUsers = await getUsers();
      setUsers(storedUsers);
    }

    loadUsers();
  }, []);

  async function refreshUsers() {
    const storedUsers = await getUsers();
    setUsers(storedUsers);
  }

  async function handleAddUser() {
    if (isSaving) {
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setMessage('');

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setMessage('Completa nombre, correo y contraseña.');
      return;
    }

    const duplicateEmail = users.some((user) => user.email.trim().toLowerCase() === cleanEmail);

    if (duplicateEmail) {
      setMessage('Ya existe un usuario con ese correo.');
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role,
      createdAt: now,
    };

    const nextUsers = [...users, newUser];
    const usersSaved = await saveUsers(nextUsers);

    if (!usersSaved) {
      setMessage('No se pudo crear el usuario. Reinicia Expo Go y vuelve a intentar.');
      setIsSaving(false);
      return;
    }

    setUsers(nextUsers);
    setName('');
    setEmail('');
    setPassword('');
    setRole('manager');
    setMessage('Usuario creado correctamente.');
    setIsSaving(false);
  }

  function requestDeleteUser(user: User) {
    if (user.id === session.userId) {
      setMessage('No puedes eliminar el usuario con la sesión activa.');
      return;
    }

    Alert.alert('Eliminar usuario', `¿Eliminar a ${user.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteUser(user.id);
        },
      },
    ]);
  }

  async function deleteUser(userId: string) {
    const nextUsers = users.filter((user) => user.id !== userId);
    const usersSaved = await saveUsers(nextUsers);

    if (!usersSaved) {
      setMessage('No se pudo eliminar el usuario. Reinicia Expo Go y vuelve a intentar.');
      return;
    }

    setUsers(nextUsers);
    setMessage('Usuario eliminado. Ya no podrá iniciar sesión.');
  }

  async function handleLoadDemo() {
    const demoSaved = await loadDemoData();

    if (!demoSaved) {
      setMessage('No se pudo cargar el demo. Reinicia Expo Go y vuelve a intentar.');
      return;
    }

    await refreshUsers();
    setMessage('Demo cargada: manager, residente, activos y eventos listos.');
  }

  async function handleClearDemo() {
    const demoCleared = await clearDemoData();

    if (!demoCleared) {
      setMessage('No se pudo limpiar el demo. Reinicia Expo Go y vuelve a intentar.');
      return;
    }

    await refreshUsers();
    setMessage('Demo limpiada. El administrador del sistema se conserva.');
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero
          label="system admin"
          title="Usuarios de Umbral"
          subtitle={`Hola, ${session.name}. Control local de accesos para el parcial.`}
        >
          <View style={styles.heroMetaRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>{users.length}</Text>
              <Text style={styles.heroPillLabel}>usuarios</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>
                {users.filter((user) => user.role === 'manager').length}
              </Text>
              <Text style={styles.heroPillLabel}>managers</Text>
            </View>
          </View>
        </HeaderHero>

        <SectionCard
          title="Agregar usuario"
          subtitle="Crea accesos locales para encargados operativos o residentes."
        >
          <AppInput
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Nombre del usuario"
          />
          <AppInput
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@ph.pa"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña temporal"
            secureTextEntry
          />

          <View style={styles.roleGroup}>
            <Text style={styles.fieldLabel}>Rol</Text>
            <View style={styles.roleRow}>
              <RoleOption
                label="Manager"
                selected={role === 'manager'}
                onPress={() => setRole('manager')}
              />
              <RoleOption
                label="Residente"
                selected={role === 'resident'}
                onPress={() => setRole('resident')}
              />
            </View>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <AppButton
            label={isSaving ? 'Guardando...' : 'Agregar usuario'}
            onPress={handleAddUser}
          />
        </SectionCard>

        <SectionCard
          title="Datos para presentación"
          subtitle="Cuentas y registros seguros para explicar el flujo sin llenar todo a mano."
          tone="tealSoft"
        >
          <View style={styles.demoActions}>
            <AppButton label="Cargar demo" onPress={handleLoadDemo} />
            <AppButton label="Limpiar demo" onPress={handleClearDemo} variant="secondary" />
          </View>
        </SectionCard>

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>Usuarios registrados</Text>
            <Text style={styles.sectionSubtitle}>Administración con persistencia local</Text>
          </View>
          <Text style={styles.count}>{users.length} total</Text>
        </View>

        {users.map((user) => {
          const isCurrentUser = user.id === session.userId;

          return (
            <RiskCard
              key={user.id}
              title={user.name}
              subtitle={user.email}
              meta={`Creado: ${formatDate(user.createdAt)}`}
              severity={getRoleSeverity(user.role)}
            >
              <View style={styles.userChipRow}>
                <StatusChip label={roleLabels[user.role]} tone={roleChipTones[user.role]} />
                {isCurrentUser ? <StatusChip label="sesión actual" tone="neutral" /> : null}
              </View>

              <Pressable
                onPress={() => requestDeleteUser(user)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  isCurrentUser && styles.disabledButton,
                  pressed && !isCurrentUser && styles.pressed,
                ]}
              >
                <Text style={[styles.deleteText, isCurrentUser && styles.disabledText]}>
                  {isCurrentUser ? 'No se puede eliminar' : 'Eliminar usuario'}
                </Text>
              </Pressable>
            </RiskCard>
          );
        })}

        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}

type RoleOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function RoleOption({ label, selected, onPress }: RoleOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleOption,
        selected && styles.roleOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.roleOptionText, selected && styles.roleOptionTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroPill: {
    backgroundColor: 'rgba(255, 248, 234, 0.14)',
    borderColor: 'rgba(255, 248, 234, 0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  heroPillValue: {
    color: colors.ivory,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  heroPillLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  roleGroup: {
    gap: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleOption: {
    alignItems: 'center',
    backgroundColor: colors.mist,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  roleOptionSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  roleOptionText: {
    color: colors.canopy,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  roleOptionTextSelected: {
    color: colors.ivory,
  },
  message: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.md,
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: spacing.md,
  },
  demoActions: {
    gap: spacing.md,
  },
  listHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sectionSubtitle: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  count: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '800',
  },
  userChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderRadius: radius.lg,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  disabledButton: {
    backgroundColor: colors.mist,
  },
  deleteText: {
    color: colors.ivory,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  disabledText: {
    color: colors.graphite,
  },
  pressed: {
    opacity: 0.82,
  },
});
