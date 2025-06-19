// import React, { FC } from 'react';
// import { Modal, TouchableOpacity, StyleSheet, Dimensions, View } from 'react-native';
// import { AntDesign } from '@expo/vector-icons';
// import Animated, { 
//   useAnimatedStyle, 
//   withSpring, 
//   useSharedValue, 
//   withTiming,
//   runOnJS 
// } from 'react-native-reanimated';

// interface Props {
//   isVisible: boolean;
//   onClose: () => void;
//   children: React.ReactNode;
//   width?: number;
//   showClose?: boolean;
// }

// const CustomModal: FC<Props> = ({ isVisible, onClose, children, width, showClose }) => {
//   const translateY = useSharedValue(1000);
//   const opacity = useSharedValue(0);

//   React.useEffect(() => {
//     if (isVisible) {
//       opacity.value = withTiming(1, { duration: 300 });
//       translateY.value = withSpring(0, {
//         damping: 15,
//         stiffness: 100,
//       });
//     } else {
//       opacity.value = withTiming(0, { duration: 300 });
//       translateY.value = withSpring(1000, {
//         damping: 15,
//         stiffness: 100,
//       }, () => runOnJS(onClose)());
//     }
//   }, [isVisible]);

//   const modalStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }]
//   }));

//   const backdropStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//   }));

//   return (
//     <Modal transparent visible={isVisible} onRequestClose={onClose}>
//       <View style={styles.centeredView}>
//         <Animated.View style={[styles.backdrop, backdropStyle]}>
//           <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
//         </Animated.View>
        
//         <Animated.View style={[styles.modalView, modalStyle, { width: width || styles.modalView.width }]}>
//           {showClose && (
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <AntDesign name="close" size={24} color="black" />
//             </TouchableOpacity>
//           )}
//           {children}
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backdrop: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   backdropTouch: {
//     width: '100%',
//     height: '100%',
//   },
//   modalView: {
//     width: Dimensions.get('window').width * 0.9,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   closeButton: {
//     position: 'absolute',
//     right: 16,
//     top: 16,
//     zIndex: 1,
//   },
// });

// export default CustomModal;