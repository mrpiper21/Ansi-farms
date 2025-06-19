import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import { baseUrl } from '../../../../config/api'
import { Colors } from '../../../../constants/Colors'
import { IconSymbol } from '../../../../components/ui/IconSymbol'
import Button from '../../../../components/buttons/basic-button'
import useAuthStore from '../../../../store/auth-store'
import responsive from '../../../../helpers/responsive'
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Farmer {
  _id: string
  name: string
  email: string
  avatar?: string
  location?: string
  description?: string
  productsCount?: number
}

const ClientHomePage = () => {
  const navigation = useNavigation() as any
  const { user } = useAuthStore((state) => state)

  // Fetch all farmers
  const { data: farmers, isLoading, isError, error } = useQuery<Farmer[]>({
    queryKey: ['farmers'],
    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/api/users/farmers`)
      return response.data.data
    }
  })

  const navigateToFarmerDetails = (farmerId: string) => {
    // navigation.navigate('FarmerDetails', { farmerId })
    navigation.navigate("dynamicNavigator", {
        screen: "farmers-details",
        params: { id: farmerId},
    })
  }

  const HeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Local Farmers</Text>
      <Text style={styles.subHeader}>Browse and connect with farmers in your area</Text>
      
      {!user && (
        <View style={styles.authButtonsContainer}>
          <Button 
            style={styles.loginButton}
            onPress={() => navigation.navigate("AuthNavigator")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </Button>
          <Button 
            style={styles.signupButton}
            onPress={() => navigation.navigate("AuthNavigator")}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </Button>
        </View>
      )}
    </View>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {(error as Error).message}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={farmers}
        numColumns={2}
         key="two-column-list"
        columnWrapperStyle={styles.columnWrapper} // Add spacing between columns
        renderItem={({ item }) => (
          <View 
            style={styles.farmerCard}
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <FontAwesome name="user-circle-o" color={Colors.light.text}  size={40} />
              </View>
            )}
            
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.farmerLocation} numberOfLines={1}>
                {item.location || 'No location'}
              </Text>
              
              <View style={styles.productsCount}>
                <IconSymbol name="basket.fill" size={16} color={Colors.light.primary} />
                <Text style={styles.productsCountText} numberOfLines={1}>
                  {item.productsCount || 0} products
                </Text>
              </View>
            </View>
            
            <Button 
              style={styles.viewDetailsButton}
              onPress={() => navigateToFarmerDetails(item._id)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </Button>
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="info" size={48} color={Colors.light.text} />
            <Text style={styles.emptyText}>No farmers found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: responsive.Dw(10)
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  farmerCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '48%', // Slightly less than half to account for spacing
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.accent_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmerInfo: {
    width: '100%',
    marginBottom: 8,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  farmerLocation: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  farmerDescription: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'center',
  },
  productsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  productsCountText: {
    fontSize: 12,
    color: Colors.light.primary,
    marginLeft: 6,
  },
  viewDetailsButton: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
  },
  viewDetailsText: {
    color: Colors.light.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 16,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.Dw(5),
    gap: 12,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    flex: 1,
  },
  signupButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})

export default ClientHomePage