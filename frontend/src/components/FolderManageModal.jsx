import { useState } from 'react'
import Modal from './Modal'

function FolderManageModal({ folders, onClose, onCreate, onUpdate, onDelete }) {
  const [folderName, setFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingName, setEditingName] = useState('')

  function handleCreate(event) {
    event.preventDefault()
    onCreate(folderName)
    setFolderName('')
  }

  function startEdit(folder) {
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
  }

  function saveEdit(folderId) {
    onUpdate(folderId, editingName)
    setEditingFolderId(null)
    setEditingName('')
  }

  return (
    <Modal title="폴더 관리" onClose={onClose}>
      <form className="inline-form folder-create-form" onSubmit={handleCreate}>
        <label className="form-field">
          <span>새 폴더 만들기</span>
          <input
            type="text"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="폴더 이름 입력"
          />
        </label>
        <button
          type="submit"
          className="primary-action"
          disabled={!folderName.trim()}
        >
          만들기
        </button>
      </form>

      <div className="folder-manage-list">
        {folders.map((folder) => (
          <div key={folder.id} className="folder-manage-row">
            {editingFolderId === folder.id ? (
              <label className="form-field compact-field">
                <span>폴더 이름</span>
                <input
                  type="text"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
              </label>
            ) : (
              <div>
                <strong>{folder.name}</strong>
                {folder.isDefault ? (
                  <p>기본 폴더는 삭제할 수 없습니다.</p>
                ) : null}
              </div>
            )}

            <div className="row-actions">
              {folder.isDefault ? null : editingFolderId === folder.id ? (
                <>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => saveEdit(folder.id)}
                    disabled={!editingName.trim()}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => setEditingFolderId(null)}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => startEdit(folder)}
                  >
                    이름 수정
                  </button>
                  <button
                    type="button"
                    className="danger-action"
                    onClick={() => onDelete(folder.id)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="modal-note">
        폴더를 삭제하면 해당 폴더에 있던 저장 공지는 기본 폴더로 이동합니다.
      </p>
    </Modal>
  )
}

export default FolderManageModal
