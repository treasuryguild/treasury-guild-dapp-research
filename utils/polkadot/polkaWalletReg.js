// utils/supabaseUtils.js
import { supabaseAnon } from '../../lib/supabaseClient';

export const checkWalletExists = async (walletAddress, blockchain) => {
  const { data, error } = await supabaseAnon
    .from('wallets')
    .select('*')
    .eq('address', walletAddress)
    .eq('blockchain', blockchain)
    .single();

  if (error) {
    console.error('Error checking wallet existence:', error);
    return false;
  }

  return !!data;
};

export const getProjectByWallet = async (walletAddress, blockchain) => {
  const { data, error } = await supabaseAnon
    .from('wallets')
    .select('project_id')
    .eq('address', walletAddress)
    .eq('blockchain', blockchain)
    .single();

  if (error) {
    console.error('Error getting project by wallet:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const { data: projectData, error: projectError } = await supabaseAnon
    .from('projects')
    .select('*, groups(*)')
    .eq('id', data.project_id)
    .single();

  if (projectError) {
    console.error('Error getting project details:', projectError);
    return null;
  }

  return projectData;
};

export const createGroup = async (groupName) => {
  const { data, error } = await supabaseAnon
    .from('groups')
    .insert({ name: groupName })
    .single()
    .select();

  if (error) {
    console.error('Error creating group:', error);
    return null;
  }

  return data;
};

export const createProject = async (groupId, projectName) => {
  const { data, error } = await supabaseAnon
    .from('projects')
    .insert({ group_id: groupId, name: projectName })
    .single()
    .select('*, groups(*)');

  if (error) {
    console.error('Error creating project:', error);
    return null;
  }

  return data;
};

export const addWalletToProject = async (projectId, walletAddress, blockchain) => {
  const { data, error } = await supabaseAnon.from('wallets').insert({
    project_id: projectId,
    address: walletAddress,
    blockchain: blockchain,
  });

  if (error) {
    console.error('Error adding wallet to project:', error);
  }
};