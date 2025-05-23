import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getSeverityStyle } from './utils/constants';
import { supabase } from '../../services/supabase';

const IssueDetailsModal = ({ issue, report, onClose, onUpdateIssue, isWhitelistUser }) => {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [displayHeight, setDisplayHeight] = useState('auto');
  const displayRef = useRef(null);
  // 添加内部状态来跟踪当前显示的issue数据
  const [currentIssue, setCurrentIssue] = useState(issue);

  // 检查是否可以编辑（只有白名单用户可以编辑，且报告状态不是 archived）
  const canEdit = isWhitelistUser && report && report.status !== 'archived';

  // 当外部传入的issue变化时，更新内部状态
  useEffect(() => {
    if (issue) {
      setCurrentIssue(issue);
    } else {
      // 如果issue为null，清空currentIssue
      setCurrentIssue(null);
    }
  }, [issue]);

  // 处理关闭按钮点击
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (displayRef.current && !isEditing) {
      // 存储当前显示内容的实际高度
      setDisplayHeight(`${displayRef.current.clientHeight}px`);
    }
  }, [currentIssue, isEditing]);

  if (!currentIssue) return null;

  // 处理文本中的转义序列，转换为实际字符
  const processText = (text) => {
    if (!text) return '';

    // 直接替换常见的转义序列
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
  };

  const formatMessage = (message) => {
    return processText(message);
  };

  const handleEditClick = () => {
    // 设置编辑初始值为格式化后的数据
    setEditedMessage(formatMessage(currentIssue.message || ''));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentIssue.id || !canEdit) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // 使用 RPC 函数检查权限
      const { data: hasPermission, error: permError } = await supabase
        .rpc('is_whitelist_user', { user_id: (await supabase.auth.getSession()).data.session?.user?.id });

      if (permError || !hasPermission) {
        console.error('权限检查失败或权限不足:', permError || '用户不在白名单中');
        setSaveError(t('reportPage.errors.permissionDenied', '权限不足：只有白名单用户才能编辑'));
        return;
      }

      // 直接保存编辑后的格式化数据
      const { error } = await supabase
        .from('audit_issues')
        .update({ message: editedMessage })
        .eq('id', currentIssue.id);

      if (error) throw error;

      // 保存成功后重新获取该记录的最新数据
      const { data, error: fetchError } = await supabase
        .from('audit_issues')
        .select('*')
        .eq('id', currentIssue.id)
        .single();

      if (fetchError) throw fetchError;

      // 更新内部状态和父组件状态
      if (data) {
        setCurrentIssue(data);

        // 使用从数据库获取的最新数据更新父组件界面
        if (onUpdateIssue) {
          onUpdateIssue(data);
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error('保存失败:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  return (
    <AnimatePresence mode="wait">
      {currentIssue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-lg max-w-4xl w-full p-6 border border-white/10 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white">{currentIssue.issue_type}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
              aria-label={t('common.close', 'Close')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(
                  currentIssue.severity
                )}`}
              >
                {currentIssue.severity?.toUpperCase()}
              </span>
              {currentIssue.feedback && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                  {currentIssue.feedback}
                </span>
              )}
              {currentIssue.false_positive && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
                  {t('reportPage.falsePositive', 'False Positive')}
                </span>
              )}
              {isWhitelistUser && canEdit && (
                <button
                  onClick={async () => {
                    if (!currentIssue.id) return;
                    setIsSaving(true);

                    try {
                      // 使用 RPC 函数检查权限
                      const { data: hasPermission, error: permError } = await supabase
                        .rpc('is_whitelist_user', { user_id: (await supabase.auth.getSession()).data.session?.user?.id });

                      if (permError || !hasPermission) {
                        console.error('权限检查失败或权限不足:', permError || '用户不在白名单中');
                        setSaveError(t('reportPage.errors.permissionDenied', '权限不足：只有白名单用户才能编辑'));
                        return;
                      }

                      // 更新 false_positive 标记
                      const newValue = !currentIssue.false_positive;
                      const { error } = await supabase
                        .from('audit_issues')
                        .update({ false_positive: newValue })
                        .eq('id', currentIssue.id);

                      if (error) throw error;

                      // 保存成功后重新获取该记录的最新数据
                      const { data, error: fetchError } = await supabase
                        .from('audit_issues')
                        .select('*')
                        .eq('id', currentIssue.id)
                        .single();

                      if (fetchError) throw fetchError;

                      // 更新内部状态和父组件状态
                      if (data) {
                        setCurrentIssue(data);
                        if (onUpdateIssue) {
                          onUpdateIssue(data);
                        }
                      }
                    } catch (error) {
                      console.error('更新误报标记失败:', error);
                      setSaveError(error.message);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentIssue.false_positive
                      ? 'bg-red-600/50 text-red-300 hover:bg-red-700/50'
                      : 'bg-gray-600/30 text-gray-300 hover:bg-red-600/30 hover:text-red-300'
                  } transition-colors ml-2`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.saving', '保存中...')}
                    </span>
                  ) : (
                    <span>
                      {currentIssue.false_positive
                        ? t('reportPage.unmarkFalsePositive', '取消误报')
                        : t('reportPage.markAsFalsePositive', '标记误报')}
                    </span>
                  )}
                </button>
              )}
              {report && (
                <span className="text-gray-400">
                  {report.user_name}/{report.repo_name}
                </span>
              )}
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                {t('reportPage.modal.fileInfo', 'File Information')}
              </h4>
              <div className="flex flex-col space-y-1">
                <div className="flex items-start">
                  <span className="text-gray-500 w-20 shrink-0 mt-1">
                    {t('reportPage.table.file', 'File')}:
                  </span>
                  <span className="text-white font-mono text-sm break-all bg-black/30 p-2 rounded border border-gray-800 max-h-24 overflow-y-auto w-full">
                    {currentIssue.file_path || 'N/A'}
                  </span>
                </div>
                {currentIssue.line_number && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-20 shrink-0">
                      {t('reportPage.table.line', 'Line')}:
                    </span>
                    <span className="text-white font-mono text-sm bg-black/30 px-2 py-1 rounded border border-gray-800">
                      {currentIssue.line_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-400">
                  {t('reportPage.modal.message', 'Message')}
                </h4>
                {!isEditing ? (
                  // 强制隐藏编辑按钮，除非明确是白名单用户
                  isWhitelistUser === true && canEdit ? (
                    <button
                      onClick={handleEditClick}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      {t('common.edit', '编辑')}
                    </button>
                  ) : null
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="text-sm text-gray-400 hover:text-gray-300 flex items-center"
                      disabled={isSaving}
                    >
                      {t('common.cancel', '取消')}
                    </button>
                    <button
                      onClick={handleSave}
                      className="text-sm text-green-400 hover:text-green-300 flex items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isSaving ? t('common.saving', '保存中...') : t('common.save', '保存')}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-black/30 rounded-lg border border-white/10">
                {!isEditing ? (
                  // 显示模式
                  <div
                    ref={displayRef}
                    className="text-white text-sm p-4 overflow-x-auto whitespace-pre-wrap"
                    style={{ minHeight: '100px', maxHeight: '400px', overflowY: 'auto' }}
                  >
                    {formatMessage(currentIssue.message)}
                  </div>
                ) : (
                  // 编辑模式 - 使用固定高度
                  <textarea
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className="w-full text-white text-sm p-4 bg-black/30 border-none focus:outline-none resize-none"
                    style={{
                      minHeight: '100px',
                      maxHeight: '400px',
                      height: displayHeight,
                      lineHeight: 'inherit',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                    }}
                    autoFocus
                  />
                )}
              </div>

              {saveError && (
                <div className="text-red-400 text-sm mt-1">
                  {t('common.error', '错误')}: {saveError}
                </div>
              )}
            </div>

            {currentIssue.code_snippet && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  {t('reportPage.modal.codeSnippet', 'Code Snippet')}
                </h4>
                <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
                  {/* Terminal-like header */}
                  <div className="bg-gray-800 px-2 py-1 flex items-center border-b border-gray-700">
                    <div className="flex space-x-1.5 mr-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-gray-400 text-xs font-medium">Code Snippet</div>
                  </div>
                  {/* Terminal content */}
                  <pre className="text-white font-mono text-sm bg-black/30 p-4 rounded-lg overflow-x-auto whitespace-pre"
                       style={{
                         maxHeight: '300px',
                         overflowY: 'auto',
                         lineHeight: 1.5
                       }}>
                    {processText(currentIssue.code_snippet)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IssueDetailsModal;
