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
        throw new Error("No wallet address found");
      }
      
      // Fetch user data
      const userData = await getUserByWalletAddress(walletAddress);
      if (!userData) {
        throw new Error("User not found");
      }
      
      setUser(userData);
      
      // Fetch payment methods
      const bankMethods = await getBankPaymentMethods(userData.id);
      const upiMethods = await getUpiPaymentMethods(userData.id);
      
      setPaymentMethods({
        bank: bankMethods || [],
        upi: upiMethods || [],
      });
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