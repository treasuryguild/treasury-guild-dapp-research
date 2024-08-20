// utils/walletReg.js
import { createSupabaseAuthClient } from '../lib/supabaseClient';

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

const getAuthenticatedClient = (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  return createSupabaseAuthClient(token);
};

export const checkWalletExists = async (token, walletAddress, blockchain) => {
  return retry(async () => {
    const supabase = getAuthenticatedClient(token);
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('address', walletAddress)
      .eq('blockchain', blockchain);

    if (error) throw error;
    return data && data.length > 0;
  });
};

export const getProjectByWallet = async (token, walletAddress, blockchain) => {
  return retry(async () => {
    const supabase = getAuthenticatedClient(token);
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('project_id')
      .eq('address', walletAddress)
      .eq('blockchain', blockchain)
      .single();

    if (walletError) throw walletError;
    if (!walletData) return null;

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*, groups(*)')
      .eq('id', walletData.project_id)
      .single();

    if (projectError) throw projectError;
    return projectData;
  });
};

export const createGroup = async (token, groupName) => {
  const supabase = getAuthenticatedClient(token);
  const { data, error } = await supabase
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

export const createProject = async (token, groupId, projectName) => {
  const supabase = getAuthenticatedClient(token);
  const { data, error } = await supabase
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

export const addWalletToProject = async (token, projectId, walletAddress, blockchain) => {
  const supabase = getAuthenticatedClient(token);
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      project_id: projectId,
      address: walletAddress,
      blockchain: blockchain,
    });

  if (error) {
    console.error('Error adding wallet to project:', error);
  }
};

export const getAllGroups = async (token) => {
  const supabase = getAuthenticatedClient(token);
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }

  return data;
};

export const getProjectsByGroup = async (token, groupId) => {
  const supabase = getAuthenticatedClient(token);
  const { data, error } = await supabase
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