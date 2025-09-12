<?php
/**
 * EventPlan Model
 * Eventra ESRS Backend
 */

class EventPlan {
    private $conn;
    private $table_name = "event_plans";

    public $id;
    public $user_id;
    public $title;
    public $type;
    public $organizer;
    public $date;
    public $time;
    public $participants;
    public $status;
    public $current_stage;
    public $facilities;
    public $documents;
    public $approval_documents;
    public $remarks;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    user_id = :user_id,
                    title = :title,
                    type = :type,
                    organizer = :organizer,
                    date = :date,
                    time = :time,
                    participants = :participants,
                    status = :status,
                    current_stage = :current_stage,
                    facilities = :facilities,
                    documents = :documents,
                    approval_documents = :approval_documents,
                    remarks = :remarks";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars($this->title ?? '');
        $this->organizer = htmlspecialchars($this->organizer ?? '');
        $this->remarks = htmlspecialchars($this->remarks ?? '');
        
        // Handle array/object to JSON conversion properly
        if (is_array($this->facilities) || is_object($this->facilities)) {
            $this->facilities = json_encode($this->facilities);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->facilities = '[]';
            }
        } else {
            $this->facilities = $this->facilities ?? '[]';
        }
        
        if (is_array($this->documents) || is_object($this->documents)) {
            $this->documents = json_encode($this->documents);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->documents = '[]';
            }
        } else {
            $this->documents = $this->documents ?? '[]';
        }
        
        if (is_array($this->approval_documents) || is_object($this->approval_documents)) {
            $this->approval_documents = json_encode($this->approval_documents);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->approval_documents = '{}';
            }
        } else {
            $this->approval_documents = $this->approval_documents ?? '{}';
        }

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":organizer", $this->organizer);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":participants", $this->participants);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":current_stage", $this->current_stage);
        $stmt->bindParam(":facilities", $this->facilities);
        $stmt->bindParam(":documents", $this->documents);
        $stmt->bindParam(":approval_documents", $this->approval_documents);
        $stmt->bindParam(":remarks", $this->remarks);

        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function read($user_id = null, $status = null, $type = null, $search = null) {
        $query = "SELECT ep.id, ep.user_id, ep.title, ep.type, ep.organizer, ep.date, ep.time, 
                         ep.participants, ep.status, ep.current_stage, ep.facilities, ep.documents, 
                         ep.remarks, ep.created_at, ep.updated_at, u.name as user_name, u.email as user_email 
                  FROM " . $this->table_name . " ep
                  LEFT JOIN users u ON ep.user_id = u.id";
        
        $conditions = [];
        $params = [];

        if ($user_id) {
            $conditions[] = "ep.user_id = :user_id";
            $params[':user_id'] = $user_id;
        }

        if ($status) {
            $conditions[] = "ep.status = :status";
            $params[':status'] = $status;
        }

        if ($type) {
            $conditions[] = "ep.type = :type";
            $params[':type'] = $type;
        }

        if ($search) {
            $conditions[] = "(ep.title LIKE :search OR ep.organizer LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        $query .= " ORDER BY ep.created_at DESC";

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        return $stmt;
    }

    public function getApprovalDocuments($event_plan_id) {
        $query = "SELECT approval_documents FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $event_plan_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['approval_documents'] : null;
    }

    public function readOne() {
        $query = "SELECT ep.*, u.name as user_name, u.email as user_email 
                  FROM " . $this->table_name . " ep
                  LEFT JOIN users u ON ep.user_id = u.id
                  WHERE ep.id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->title = $row['title'];
            $this->type = $row['type'];
            $this->organizer = $row['organizer'];
            $this->date = $row['date'];
            $this->time = $row['time'];
            $this->participants = $row['participants'];
            $this->status = $row['status'];
            $this->current_stage = $row['current_stage'];
            
            // Safely decode JSON fields with error handling
            if ($row['facilities']) {
                $decoded_facilities = json_decode($row['facilities'], true);
                $this->facilities = (json_last_error() === JSON_ERROR_NONE) ? $decoded_facilities : [];
            } else {
                $this->facilities = [];
            }
            
            if ($row['documents']) {
                $decoded_documents = json_decode($row['documents'], true);
                $this->documents = (json_last_error() === JSON_ERROR_NONE) ? $decoded_documents : [];
            } else {
                $this->documents = [];
            }
            
            if ($row['approval_documents']) {
                $decoded_approval_docs = json_decode($row['approval_documents'], true);
                $this->approval_documents = (json_last_error() === JSON_ERROR_NONE) ? $decoded_approval_docs : [];
            } else {
                $this->approval_documents = [];
            }
            
            $this->remarks = $row['remarks'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    title = :title,
                    type = :type,
                    organizer = :organizer,
                    date = :date,
                    time = :time,
                    participants = :participants,
                    status = :status,
                    current_stage = :current_stage,
                    facilities = :facilities,
                    documents = :documents,
                    approval_documents = :approval_documents,
                    remarks = :remarks
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars($this->title ?? '');
        $this->organizer = htmlspecialchars($this->organizer ?? '');
        $this->remarks = htmlspecialchars($this->remarks ?? '');
        $this->facilities = is_array($this->facilities) ? json_encode($this->facilities) : $this->facilities;
        $this->documents = is_array($this->documents) ? json_encode($this->documents) : $this->documents;
        $this->approval_documents = is_array($this->approval_documents) ? json_encode($this->approval_documents) : $this->approval_documents;

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":organizer", $this->organizer);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":participants", $this->participants);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":current_stage", $this->current_stage);
        $stmt->bindParam(":facilities", $this->facilities);
        $stmt->bindParam(":documents", $this->documents);
        $stmt->bindParam(":approval_documents", $this->approval_documents);
        $stmt->bindParam(":remarks", $this->remarks);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?> 