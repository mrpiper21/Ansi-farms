import React, { forwardRef, ReactNode, useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, Pressable, StyleProp, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface FormTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  error?: string;
  secure?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const FormTextInput = forwardRef<TextInput, FormTextInputProps>((props, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showSecureText, setShowSecureText] = useState(false);

  const {
    label,
    iconLeft,
    iconRight,
    error,
    secure = false,
    style,
    ...restProps
  } = props;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputContainer,
        {
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : 'grey',
        }
      ]}>
        {iconLeft && (
          <View style={styles.iconLeft}>
            {iconLeft}
          </View>
        )}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: iconLeft ? 40 : 16,
              paddingRight: iconRight || secure ? 40 : 16,
            }
          ]}
          placeholderTextColor={colors.text + '80'}
          secureTextEntry={secure && !showSecureText}
          {...restProps}
        />

        {(secure || iconRight) && (
          <View style={styles.iconRight}>
            {secure ? (
              <Pressable
                onPress={() => setShowSecureText(!showSecureText)}
                hitSlop={10}
              >
                <MaterialIcons
                  name={showSecureText ? 'visibility-off' : 'visibility'}
                  size={24}
                  color={colors.text + '80'}
                />
              </Pressable>
            ) : iconRight}
          </View>
        )}
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormTextInput;