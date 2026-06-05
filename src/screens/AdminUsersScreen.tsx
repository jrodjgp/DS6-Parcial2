import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
import { StatusChip } from '../components/StatusChip';
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
    await saveUsers(nextUsers);
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
    await saveUsers(nextUsers);
    setUsers(nextUsers);
    setMessage('Usuario eliminado. Ya no podrá iniciar sesión.');
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <StatusChip label="system admin" tone="warning" />
          <Text style={styles.title}>Usuarios de Umbral</Text>
          <Text style={styles.greeting}>Hola, {session.name}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Agregar usuario</Text>
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
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Usuarios registrados</Text>
          <Text style={styles.count}>{users.length} total</Text>
        </View>

        {users.map((user) => {
          const isCurrentUser = user.id === session.userId;

          return (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userTopRow}>
                <StatusChip label={user.role} tone={roleChipTones[user.role]} />
                {isCurrentUser ? <Text style={styles.currentTag}>Sesión actual</Text> : null}
              </View>

              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userMeta}>Rol: {roleLabels[user.role]}</Text>
              <Text style={styles.userMeta}>Creado: {formatDate(user.createdAt)}</Text>

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
            </View>
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
  header: {
    backgroundColor: colors.deepCanopy,
    borderBottomColor: colors.guayacanGold,
    borderBottomWidth: 6,
    borderRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.cardIvory,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
  },
  greeting: {
    color: colors.mistGreen,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  formCard: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.umbralInk,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  fieldLabel: {
    color: colors.umbralInk,
    fontSize: 15,
    fontWeight: '700',
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
    backgroundColor: colors.mistGreen,
    borderColor: colors.deepCanopy,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  roleOptionSelected: {
    backgroundColor: colors.isthmusTeal,
    borderColor: colors.isthmusTeal,
  },
  roleOptionText: {
    color: colors.deepCanopy,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  roleOptionTextSelected: {
    color: colors.cardIvory,
  },
  message: {
    color: colors.deepCanopy,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  count: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '700',
  },
  userCard: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  userTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentTag: {
    color: colors.graphite,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  userName: {
    color: colors.umbralInk,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  userEmail: {
    color: colors.deepCanopy,
    fontSize: 15,
    fontWeight: '700',
  },
  userMeta: {
    color: colors.graphite,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.coralAlerta,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  disabledButton: {
    backgroundColor: colors.mistGreen,
  },
  deleteText: {
    color: colors.cardIvory,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  disabledText: {
    color: colors.graphite,
  },
  pressed: {
    opacity: 0.78,
  },
});
