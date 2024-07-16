// utils/walletReg.js
import { supabaseAnon } from '../lib/supabaseClient';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retry = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

export const checkWalletExists = async (walletAddress, blockchain) => {
  return retry(async () => {
    const { data, error } = await supabaseAnon
      .from('wallets')
      .select('*')
      .eq('address', walletAddress)
      .eq('blockchain', blockchain)
      .single();

    if (error) throw error;
    return !!data;
  });
};

export const getProjectByWallet = async (walletAddress, blockchain) => {
  return retry(async () => {
    const { data: walletData, error: walletError } = await supabaseAnon
      .from('wallets')
      .select('project_id')
      .eq('address', walletAddress)
      .eq('blockchain', blockchain)
      .single();

    if (walletError) throw walletError;
    if (!walletData) return null;

    const { data: projectData, error: projectError } = await supabaseAnon
      .from('projects')
      .select('*, groups(*)')
      .eq('id', walletData.project_id)
      .single();

    if (projectError) throw projectError;
    return projectData;
  });
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

export const getAllGroups = async () => {
  const { data, error } = await supabaseAnon
    .from('groups')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }

  return data;
};

export const getProjectsByGroup = async (groupId) => {
  const { data, error } = await supabaseAnon
    .from('projects')
    .select('*')
    .eq('group_id', groupId)
    .order('name');

  if (error) {
    console.error('Error fetching projects for group:', error);
    return [];
  }

  return data;
};