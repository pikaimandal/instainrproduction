import { useState, useEffect } from "react";
import { getUserByWalletAddress } from "@/lib/services/userService";
import { getBankPaymentMethods, getUpiPaymentMethods } from "@/lib/services/paymentMethodService";
import { User, BankPaymentMethod, UpiPaymentMethod } from "@/types/database";

export interface UserData {
  user: User | null;
  paymentMethods: {
    bank: BankPaymentMethod[];
    upi: UpiPaymentMethod[];
  };
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}

export function useUser(): UserData {
  const [user, setUser] = useState<User | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{
    bank: BankPaymentMethod[];
    upi: UpiPaymentMethod[];
  }>({
    bank: [],
    upi: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const walletAddress = localStorage.getItem("wallet_address");
      if (!walletAddress) {
        setError("No wallet address found. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      // Fetch user data
      const userData = await getUserByWalletAddress(walletAddress);
      if (!userData) {
        setError("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      setUser(userData);
      
      // Fetch payment methods
      try {
        const bankMethods = await getBankPaymentMethods(userData.id);
        const upiMethods = await getUpiPaymentMethods(userData.id);
        
        setPaymentMethods({
          bank: bankMethods || [],
          upi: upiMethods || [],
        });
      } catch (paymentError) {
        console.error("Error fetching payment methods:", paymentError);
        // Don't set error here, just use empty arrays
        setPaymentMethods({
          bank: [],
          upi: [],
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err.message : "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    user,
    paymentMethods,
    isLoading,
    error,
    refreshUserData: fetchUserData,
  };
} 