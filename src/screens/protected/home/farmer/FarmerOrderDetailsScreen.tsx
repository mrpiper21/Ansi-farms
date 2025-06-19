import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Picker } from '@react-native-picker/picker'
import { Colors } from '../../../../constants/Colors'
import { IconSymbol } from '../../../../components/ui/IconSymbol'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { baseUrl } from '../../../../config/api'
import useAuthStore from '../../../../store/auth-store'
import responsive from '../../../../helpers/responsive'

type DetailsProps = {
  "farmerOrder-details": { id: string }
}

type OrderProps = RouteProp<DetailsProps>

interface Props {
  route: OrderProps
}

interface Order {
  _id: string
  buyer?: {
    avatar?: string
    name?: string
    email?: string
  }
  items: Array<{
    product?: {
      name?: string
      imageUrl?: string
    }
    price: number
    quantity: number
  }>
  status: string
  totalAmount: number
  createdAt: string
  notes?: string
}

const FarmerOrderDetailsScreen = ({ route }: Props) => {
  const { id } = route.params
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const {user} = useAuthStore((state)  => state)

  // Fetch order details
  const { data: order, isLoading, isError, error } = useQuery<Order>({
    queryKey: ['farmerOrder', id],
    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/api/orders/farmer-orders/single/${user?.id}/${id}`)
      return response.data.data
    }
  })

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await axios.patch(`${baseUrl}/api/orders/farmer-orders/${id}/status`, { status: newStatus })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerOrder', id] })
      Alert.alert('Success', 'Order status updated successfully')
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status')
    }
  })

  const handleStatusChange = (newStatus: string) => {
    console.log(newStatus, "status value")
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to change status to ${newStatus}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        { 
          text: 'Confirm', 
          onPress: () => {
            setStatus(newStatus);
            updateStatusMutation.mutate(newStatus);
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Error: {(error as Error).message}</Text>
      </View>
    )
  }

  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Order Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="arrow.backward" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      {/* Order Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order ID:</Text>
          <Text style={styles.summaryValue}>#{order?._id?.toString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order?.status) }]}>
            <Text style={styles.statusText}>{order?.status?.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={[styles.summaryValue, styles.totalAmount]}>${order?.totalAmount?.toFixed(2)}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.customerCard}>
          {order.buyer?.avatar ? (
            <Image source={{ uri: order.buyer.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <IconSymbol name="person" size={24} color={Colors.light.text} />
            </View>
          )}
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{order.buyer?.name || 'Customer'}</Text>
            <Text style={styles.customerEmail}>{order.buyer?.email || ''}</Text>
            <Text style={styles.customerMeta}>Placed on {formatDate(order.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items ({order?.items?.length})</Text>
        {order.items?.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            {item.product?.imageUrl ? (
              <Image source={{ uri: item?.product?.imageUrl }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.productImagePlaceholder]}>
                <IconSymbol name="person" size={24} color={Colors.light.text} />
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.productName} numberOfLines={1}>{item.product?.name || 'Product'}</Text>
              <Text style={styles.productPrice}>${item?.price?.toFixed(2)} × {item.quantity}</Text>
              <Text style={styles.productTotal}>${(item?.price * item?.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Update Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Order Status</Text>
        <View style={styles.statusUpdateCard}>
          <Picker
            selectedValue={status || order.status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            style={styles.picker}
            dropdownIconColor={Colors.light.primary}
          >
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="Confirmed" value="confirmed" />
            <Picker.Item label="Shipped" value="shipped" />
            <Picker.Item label="Delivered" value="delivered" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleStatusChange(status)}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <ActivityIndicator color={Colors.light.surface} />
            ) : (
              <Text style={styles.updateButtonText}>Update Status</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Notes</Text>
        <View style={styles.notesCard}>
          <Text style={styles.notesText}>
            {order.notes || 'No additional notes for this order'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return Colors.light.warning
    case 'confirmed': return Colors.light.info
    case 'shipped': return Colors.light.primary
    case 'delivered': return Colors.light.success
    case 'cancelled': return Colors.light.error
    default: return Colors.light.text
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.accent_green,
    marginTop: responsive.Dw(10)
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  summaryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontSize: 18,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.surface,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.accent_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  customerMeta: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.6,
  },
  itemCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    backgroundColor: Colors.light.accent_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  statusUpdateCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  picker: {
    backgroundColor: Colors.light.accent_green,
    borderRadius: 8,
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: Colors.light.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  notesCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
})

export default FarmerOrderDetailsScreen