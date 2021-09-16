const Rating = (props) => {
  return (
    <div class="rating-group">
      <div class="rate">
        <input type="radio" id="star5" name="rate" value="5" />
        <label for="star5" title="text">
          <i
            class="rating__icon rating__icon--star fa fa-star"
            onClick={() => props.onRatePressed(5)}
          />
        </label>
        <input type="radio" id="star4" name="rate" value="4" />
        <label for="star4" title="text">
          <i
            class="rating__icon rating__icon--star fa fa-star"
            onClick={() => props.onRatePressed(4)}
          />
        </label>
        <input type="radio" id="star3" name="rate" value="3" />
        <label for="star3" title="text">
          <i
            class="rating__icon rating__icon--star fa fa-star"
            onClick={() => props.onRatePressed(3)}
          />
        </label>
        <input type="radio" id="star2" name="rate" value="2" />
        <label for="star2" title="text">
          <i
            class="rating__icon rating__icon--star fa fa-star"
            onClick={() => props.onRatePressed(2)}
          />
        </label>
        <input type="radio" id="star1" name="rate" value="1" />
        <label for="star1" title="text">
          <i
            class="rating__icon rating__icon--star fa fa-star"
            onClick={() => props.onRatePressed(1)}
          />
        </label>
      </div>
    </div>
  );
};

export default Rating;
