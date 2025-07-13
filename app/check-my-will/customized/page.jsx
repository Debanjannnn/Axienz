"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, Minus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS as WILL_MANAGER_ADDRESS } from '@/utils';
import WILL_MANAGER_ABI from "@/abi"



const CreateCustomizedWill = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [milestones, setMilestones] = useState([{
    beneficiary: '',
    releaseTime: '',
    releasePercentage: '',
    description: ''
  }]);
  const [totalAmount, setTotalAmount] = useState('');

  const addMilestone = () => {
    setMilestones([...milestones, {
      beneficiary: '',
      releaseTime: '',
      releasePercentage: '',
      description: ''
    }]);
  };

  const removeMilestone = (index) => {
    if (milestones.length > 1) {
      const newMilestones = milestones.filter((_, i) => i !== index);
      setMilestones(newMilestones);
    }
  };

  const updateMilestone = (index, field, value) => {
    const updatedMilestones = milestones.map((milestone, i) => {
      if (i === index) {
        return { ...milestone, [field]: value };
      }
      return milestone;
    });
    setMilestones(updatedMilestones);
  };

  const createWill = async (beneficiaries, releaseTimes, releasePercentages, descriptions) => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to create a will');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(WILL_MANAGER_ADDRESS, WILL_MANAGER_ABI, signer);

      // Convert ETH amount to Wei
      const amountInWei = ethers.parseEther(totalAmount);

      // Create the will
      const tx = await contract.createMilestoneWill(
        beneficiaries,
        releaseTimes,
        releasePercentages,
        descriptions,
        { value: amountInWei }
      );

      setLoading(true);
      await tx.wait();
      setSuccess('Will created successfully! Transaction hash: ' + tx.hash);
    } catch (err) {
      throw new Error(err.message || 'Error creating will');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validation
      const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.releasePercentage), 0);
      if (totalPercentage !== 100) {
        throw new Error('Total percentage must equal 100%');
      }

      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Prepare data for contract
      const beneficiaries = milestones.map(m => m.beneficiary);
      const releaseTimes = milestones.map(m => Math.floor(new Date(m.releaseTime).getTime() / 1000));
      const releasePercentages = milestones.map(m => Number(m.releasePercentage));
      const descriptions = milestones.map(m => m.description);

      // Create the will
      await createWill(beneficiaries, releaseTimes, releasePercentages, descriptions);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Create Customized Will</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Amount (ETH)
            </label>
            <Input
              type="number"
              step="0.001"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter amount in ETH"
              required
              className="w-full"
            />
          </div>

          {milestones.map((milestone, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Milestone {index + 1}</h3>
                {milestones.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeMilestone(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Beneficiary Address
                  </label>
                  <Input
                    type="text"
                    value={milestone.beneficiary}
                    onChange={(e) => updateMilestone(index, 'beneficiary', e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Release Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={milestone.releaseTime}
                    onChange={(e) => updateMilestone(index, 'releaseTime', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Percentage (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={milestone.releasePercentage}
                    onChange={(e) => updateMilestone(index, 'releasePercentage', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    placeholder="Describe the milestone conditions..."
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Will...</>
            ) : (
              'Create Customized Will'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCustomizedWill;